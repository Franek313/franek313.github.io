#include <WiFi.h>
#include <WebServer.h>
#include <ESPmDNS.h>
#include <FastLED.h>
#include "index.h"  // zawiera PAGE_INDEX z HTML (patrz niżej)

// ====== Wi-Fi ======
const char* WIFI_SSID = "Dom Frania 2.4G";
const char* WIFI_PASS = "franekfranek";
const char* HOSTNAME  = "rpgeffects";   // -> http://rpgeffects.local

// ====== LED strip ======
#define DATA_PIN     13
#define NUM_LEDS     60
#define LED_TYPE     WS2812B
#define COLOR_ORDER  RBG
CRGB leds[NUM_LEDS];

bool     isOn          = true;
uint8_t  bright        = 128;
uint8_t  targetBright  = bright;

// Docelowe wartości do płynnego przejścia

CHSV    currentHSV  = CHSV(0, 255, 255);
CHSV    targetHSV   = currentHSV;

// Szybkość wygładzania (im większe, tym szybciej)
const uint8_t LERP_SPEED = 20;

// --- FLASH state ---
bool     flashActive   = false;
uint32_t flashUntilMs  = 0;

CHSV     savedHSV      = CHSV(0,255,255);
uint8_t  savedBright   = 255;

WebServer server(80);

// --- Pomocnicze ---
void applyLeds(){
  FastLED.setBrightness(isOn ? bright : 0);
  for (int i = 0; i < NUM_LEDS; i++) leds[i] = currentHSV; // przypisujesz CHSV
  FastLED.show();
}

uint8_t hex2(byte c){ if(c>='0'&&c<='9') return c-'0'; c|=0x20; if(c>='a'&&c<='f') return 10+(c-'a'); return 0; }
bool parseHexColor(const String& s, CRGB& out){
  if (s.length()!=7 || s[0]!='#') return false;
  auto hx=[&](int i){ return (hex2(s[i])<<4)|hex2(s[i+1]); };
  out = CRGB(hx(1),hx(3),hx(5));
  return true;
}

// --- HTTP Handlers ---
void handleIndex(){
  String html = FPSTR(PAGE_INDEX);
  server.send(200, "text/html", html);
}
void handleState(){
  char buf[128];
  CRGB rgb;
  hsv2rgb_rainbow(currentHSV, rgb); // konwersja HSV -> RGB

  snprintf(buf, sizeof(buf),
    "{\"on\":%s,\"bright\":%u,\"color\":\"#%02x%02x%02x\"}",
    isOn ? "true" : "false",
    bright,
    rgb.r, rgb.g, rgb.b
  );

  server.send(200, "application/json", buf);
}

void handleSet(){
  if (server.hasArg("on"))
    isOn = (server.arg("on")=="1" || server.arg("on")=="true");

  if (server.hasArg("br")) {
    int b = server.arg("br").toInt();
    if (b < 0) b = 0; if (b > 255) b = 255;
    targetBright = (uint8_t)b;
  }

  if (server.hasArg("h")) {
    int h = server.arg("h").toInt();
    if (h < 0) h = 0; if (h > 255) h = 255;
    targetHSV.h = (uint8_t)h;      // pełne nasycenie i wartość trzymamy na 255
    targetHSV.s = 255;
    targetHSV.v = 255;
  }

  // (opcjonalny fallback) jeśli kiedyś wyślesz color=#RRGGBB:
  if (server.hasArg("color")) {
    CRGB c; if (parseHexColor(server.arg("color"), c)) {
      CHSV hsv = rgb2hsv_approximate(c);
      targetHSV = CHSV(hsv.h, 255, 255);
    }
  }

  // zwróć stan
  char buf[128];
  CRGB rgb; hsv2rgb_rainbow(currentHSV, rgb);
  snprintf(buf,sizeof(buf),
    "{\"on\":%s,\"bright\":%u,\"color\":\"#%02x%02x%02x\"}",
    isOn?"true":"false", bright, rgb.r, rgb.g, rgb.b);
  server.send(200,"application/json",buf);
}

// --- Wi-Fi/mDNS ---
void connectWiFi(){
  WiFi.mode(WIFI_STA);
  WiFi.setHostname(HOSTNAME);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.print("Łączenie z Wi-Fi");
  int tries=0;
  while (WiFi.status()!=WL_CONNECTED) { delay(300); Serial.print("."); if(++tries>200) break; }
  Serial.println();
  if (WiFi.status()==WL_CONNECTED){
    Serial.print("Połączono. IP: "); Serial.println(WiFi.localIP());
  } else {
    Serial.println("Nie udało się połączyć (SSID/hasło lub pasmo 2.4 GHz).");
  }
  Serial.print("MAC: "); Serial.println(WiFi.macAddress());
}

// helper: odpal flash
void startFlash(uint16_t ms, uint8_t flashBright /*0..255*/) {
  // zapisz stan
  savedHSV    = currentHSV;
  savedBright = bright;

  // ustaw biały, max nasycenie i V (biel w HSV to S=0,V=255)
  currentHSV = CHSV(0, 0, 255);
  bright     = flashBright;

  flashActive  = true;
  flashUntilMs = millis() + ms;

  applyLeds();
}

void endFlashRestore() {
  flashActive = false;
  currentHSV  = savedHSV;
  bright      = savedBright;
  applyLeds();
}

void handleFlash() {
  // /api/flash?ms=200&br=255
  uint16_t ms = 200;
  uint8_t  br = 255;

  if (server.hasArg("ms")) ms = (uint16_t) server.arg("ms").toInt();
  if (server.hasArg("br")) {
    int b = server.arg("br").toInt();
    if (b < 0) b = 0; if (b > 255) b = 255;
    br = (uint8_t)b;
  }

  startFlash(ms, br);
  server.send(200, "application/json", "{\"ok\":true}");
}

void setup(){
  Serial.begin(115200);
  FastLED.addLeds<LED_TYPE, DATA_PIN, COLOR_ORDER>(leds, NUM_LEDS);
  FastLED.setCorrection(TypicalLEDStrip);
  FastLED.setDither(1);             // możesz dać 0 na testy czystych kanałów
  FastLED.clear(true);

  currentHSV = CHSV(0,255,bright);

  connectWiFi();

  if (MDNS.begin(HOSTNAME)) {
    MDNS.addService("http","tcp",80);
    Serial.printf("mDNS OK: http://%s.local\n", HOSTNAME);
  } else {
    Serial.println("mDNS nie działa.");
  }

  server.on("/", handleIndex);
  server.on("/api/state", HTTP_GET, handleState);
  server.on("/api/set",   HTTP_GET, handleSet);
  server.on("/api/flash", HTTP_GET, handleFlash);
  server.begin();
  Serial.println("HTTP server start");

  applyLeds();
}

static uint8_t stepHue(uint8_t cur, uint8_t tgt, uint8_t step){
  if (cur == tgt) return cur;
  int16_t d = (int16_t)tgt - cur;
  if (d > 127)  d -= 256;
  if (d < -127) d += 256;
  int8_t dir = (d > 0) ? 1 : -1;
  uint8_t move = step;             // ile „stopni” na iterację
  if (abs(d) < move) move = abs(d);
  return (uint8_t)(cur + dir * move);
}

void loop(){
  if (WiFi.status()!=WL_CONNECTED) connectWiFi();
  server.handleClient();

  // Jeśli aktywny flash – priorytet (nic nie wygładzaj teraz)
  if (flashActive) {
    if ((int32_t)(millis() - flashUntilMs) >= 0) {
      endFlashRestore();
    }
    return; // flash ma pierwszeństwo
  }

  bool needsUpdate = false;

  uint8_t newH = stepHue(currentHSV.h, targetHSV.h, /*szybkość*/ 2); // dostrój np. 2–8
  if (newH != currentHSV.h) { currentHSV.h = newH; needsUpdate = true; }

  // nasycenie i wartość trzymamy na 255, ale gdybyś chciał je też wygładzać:
  // currentHSV.s = lerp8by8(currentHSV.s, targetHSV.s, 20);
  
  if(bright != targetBright){
    if(targetBright == 0)
    {
      bright = 0;
    }
    else
    {
      bright = lerp8by8(bright, targetBright, 20);
    }
    needsUpdate = true;
  }

  if (needsUpdate) applyLeds();
}
