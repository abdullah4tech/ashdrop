package main

import (
	"crypto/ecdh"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

func testPublicKey(t *testing.T) string {
	t.Helper()
	private, err := ecdh.P256().GenerateKey(rand.Reader)
	if err != nil {
		t.Fatal(err)
	}
	return base64.RawURLEncoding.EncodeToString(private.PublicKey().Bytes())
}

func testStore(t *testing.T) *Store {
	t.Helper()
	store, err := OpenStore(filepath.Join(t.TempDir(), "ashdrop.db"))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() {
		if err := store.Close(); err != nil {
			t.Error(err)
		}
	})
	return store
}

func TestValidPublicKeyRejectsOffCurvePoint(t *testing.T) {
	if !validPublicKey(testPublicKey(t)) {
		t.Fatal("generated P-256 public key was rejected")
	}

	offCurve := make([]byte, 65)
	offCurve[0] = 0x04
	if validPublicKey(base64.RawURLEncoding.EncodeToString(offCurve)) {
		t.Fatal("off-curve SEC1 point was accepted")
	}
}

func TestCreateRejectsInvalidOrPartialRecipientKeys(t *testing.T) {
	store := testStore(t)
	handler := newHandler(store)
	valid := testPublicKey(t)
	offCurve := make([]byte, 65)
	offCurve[0] = 0x04
	invalid := base64.RawURLEncoding.EncodeToString(offCurve)

	for name, keys := range map[string]struct{ recipient, ephemeral string }{
		"off-curve recipient": {recipient: invalid, ephemeral: valid},
		"missing recipient":   {ephemeral: valid},
		"missing ephemeral":   {recipient: valid},
	} {
		t.Run(name, func(t *testing.T) {
			body, err := json.Marshal(map[string]any{
				"ciphertext":   "ciphertext",
				"iv":           "iv",
				"recipientPub": keys.recipient,
				"ephemeralPub": keys.ephemeral,
			})
			if err != nil {
				t.Fatal(err)
			}
			request := httptest.NewRequest(http.MethodPost, "/api/secrets", strings.NewReader(string(body)))
			response := httptest.NewRecorder()
			handler.ServeHTTP(response, request)
			if response.Code != http.StatusBadRequest {
				t.Fatalf("status = %d, want %d", response.Code, http.StatusBadRequest)
			}
		})
	}
}

func TestPartialRecipientMaterialIsUnavailable(t *testing.T) {
	store := testStore(t)
	if err := store.Put("legacy", Secret{
		Ciphertext:   "ciphertext",
		IV:           "iv",
		ExpiresAt:    time.Now().Add(time.Hour).Unix(),
		NotifyTok:    "notify",
		EphemeralPub: testPublicKey(t),
	}); err != nil {
		t.Fatal(err)
	}

	for name, operation := range map[string]func() (*Secret, error){
		"metadata": func() (*Secret, error) { return store.Metadata("legacy") },
		"fetch":    func() (*Secret, error) { return store.Fetch("legacy") },
		"open":     func() (*Secret, error) { return store.Open("legacy") },
	} {
		t.Run(name, func(t *testing.T) {
			secret, err := operation()
			if err != nil {
				t.Fatal(err)
			}
			if secret != nil {
				t.Fatal("partial recipient material exposed a drop")
			}
		})
	}
}
