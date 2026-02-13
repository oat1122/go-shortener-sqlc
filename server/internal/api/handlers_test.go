package api

import (
	"bytes"
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"go-shortener-sqlc/internal/db"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/go-chi/chi/v5"
)

func TestShortenURL(t *testing.T) {
	// Initialize mock db
	mockDB, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("an error '%s' was not expected when opening a stub database connection", err)
	}
	defer mockDB.Close()

	// Create queries with mock db
	queries := db.New(mockDB)
	server := &Server{
		Queries: queries,
		DB:      mockDB,
	}

	tests := []struct {
		name           string
		body           interface{}
		mockBehavior   func()
		expectedStatus int
	}{
		{
			name: "Success",
			body: ShortenRequest{URL: "https://example.com"},
			mockBehavior: func() {
				// Expect check for collision (GetURL returns no rows)
				mock.ExpectQuery("SELECT id, short_code, original_url, created_at FROM urls").
					WithArgs(sqlmock.AnyArg()).
					WillReturnError(sql.ErrNoRows)

				// Expect insertion
				mock.ExpectExec("INSERT INTO urls").
					WithArgs(sqlmock.AnyArg(), "https://example.com").
					WillReturnResult(sqlmock.NewResult(1, 1))
			},
			expectedStatus: http.StatusOK,
		},
		{
			name:           "Invalid Body",
			body:           "invalid json",
			mockBehavior:   func() {},
			expectedStatus: http.StatusBadRequest,
		},
		{
			name:           "Missing URL",
			body:           ShortenRequest{URL: ""},
			mockBehavior:   func() {},
			expectedStatus: http.StatusBadRequest,
		},
		{
			name:           "Invalid URL Format",
			body:           ShortenRequest{URL: "ftp://example.com"},
			mockBehavior:   func() {},
			expectedStatus: http.StatusBadRequest,
		},
		{
			name: "Database Error",
			body: ShortenRequest{URL: "https://example.com"},
			mockBehavior: func() {
				// Expect collision check first
				mock.ExpectQuery("SELECT id, short_code, original_url, created_at FROM urls").
					WithArgs(sqlmock.AnyArg()).
					WillReturnError(sql.ErrNoRows)

				mock.ExpectExec("INSERT INTO urls").
					WithArgs(sqlmock.AnyArg(), "https://example.com").
					WillReturnError(errors.New("db error"))
			},
			expectedStatus: http.StatusInternalServerError,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			tc.mockBehavior()

			var reqBody []byte
			if s, ok := tc.body.(string); ok {
				reqBody = []byte(s)
			} else {
				reqBody, _ = json.Marshal(tc.body)
			}

			req, _ := http.NewRequest("POST", "/shorten", bytes.NewBuffer(reqBody))
			rr := httptest.NewRecorder()

			server.ShortenURL(rr, req)

			if rr.Code != tc.expectedStatus {
				t.Errorf("handler returned wrong status code: got %v want %v",
					rr.Code, tc.expectedStatus)
			}

			if err := mock.ExpectationsWereMet(); err != nil {
				t.Errorf("there were unfulfilled expectations: %s", err)
			}
		})
	}
}

func TestRedirectURL(t *testing.T) {
	// Initialize mock db
	mockDB, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("an error '%s' was not expected when opening a stub database connection", err)
	}
	defer mockDB.Close()

	queries := db.New(mockDB)
	server := &Server{
		Queries: queries,
		DB:      mockDB,
	}

	tests := []struct {
		name           string
		shortCode      string
		mockBehavior   func()
		expectedStatus int
		expectedLoc    string
	}{
		{
			name:      "Success",
			shortCode: "abcdef",
			mockBehavior: func() {
				rows := sqlmock.NewRows([]string{"id", "short_code", "original_url", "created_at"}).
					AddRow(1, "abcdef", "https://example.com", time.Now())
				mock.ExpectQuery("SELECT id, short_code, original_url, created_at FROM urls").
					WithArgs("abcdef").
					WillReturnRows(rows)
			},
			expectedStatus: http.StatusFound,
			expectedLoc:    "https://example.com",
		},
		{
			name:      "Not Found",
			shortCode: "notfound",
			mockBehavior: func() {
				mock.ExpectQuery("SELECT id, short_code, original_url, created_at FROM urls").
					WithArgs("notfound").
					WillReturnError(sql.ErrNoRows)
			},
			expectedStatus: http.StatusNotFound,
		},
		{
			name:      "Database Error",
			shortCode: "dberror",
			mockBehavior: func() {
				mock.ExpectQuery("SELECT id, short_code, original_url, created_at FROM urls").
					WithArgs("dberror").
					WillReturnError(errors.New("db error"))
			},
			expectedStatus: http.StatusInternalServerError,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			tc.mockBehavior()

			req, _ := http.NewRequest("GET", "/"+tc.shortCode, nil)

			// Setup chi context for URL param
			rctx := chi.NewRouteContext()
			rctx.URLParams.Add("code", tc.shortCode)
			req = req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, rctx))

			rr := httptest.NewRecorder()

			server.RedirectURL(rr, req)

			if rr.Code != tc.expectedStatus {
				t.Errorf("handler returned wrong status code: got %v want %v",
					rr.Code, tc.expectedStatus)
			}

			if tc.expectedStatus == http.StatusFound {
				loc := rr.Header().Get("Location")
				if loc != tc.expectedLoc {
					t.Errorf("handler returned wrong location: got %v want %v",
						loc, tc.expectedLoc)
				}
			}

			if err := mock.ExpectationsWereMet(); err != nil {
				t.Errorf("there were unfulfilled expectations: %s", err)
			}
		})
	}
}
