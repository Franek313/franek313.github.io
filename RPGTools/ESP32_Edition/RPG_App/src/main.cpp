#include <WiFi.h>
#include <WebServer.h>
#include <ESPmDNS.h>
#include <FastLED.h>
#include "index.h"

// ====== Twoje Wi-Fi ======
const char* WIFI_SSID = "Dom Frania 2.4G";
const char* WIFI_PASS = "franekfranek";
const char* HOSTNAME  = "esp32-led";   // -> http://esp32-led.local

// ====== URL utworu (GitHub Pages) ======
const char* TRACK_URL = "https://franek313.github.io/RPGTools/Audio/Action/19%20-%20The%20Witcher%202%20Score%20-%20Easier%20Said%20Than%20Killed%20(Extended).mp3";

// ====== LED strip (jak u Ciebie) ======
#define DATA_PIN     13
#define NUM_LEDS     60
#define LED_TYPE     WS2812B
#define COLOR_ORDER  GRB
CRGB leds[NUM_LEDS];
bool     isOn   = false;
uint8_t  bright = 128;
CRGB     currentColor = CRGB::White;

WebServer server(80);

void applyLeds(){
  FastLED.setBrightness(isOn ? bright : 0);
  for(int i=0;i<NUM_LEDS;i++) leds[i]=currentColor;
  FastLED.show();
}

uint8_t hex2(byte c){ if(c>='0'&&c<='9') return c-'0'; c|=0x20; if(c>='a'&&c<='f') return 10+(c-'a'); return 0; }
bool parseHexColor(const String& s, CRGB& out){
  if (s.length()!=7 || s[0]!='#') return false;
  auto hx=[&](int i){ return (hex2(s[i])<<4)|hex2(s[i+1]); };
  out = CRGB(hx(1),hx(3),hx(5)); return true;
}

// Generujemy HTML z podmianą {{TRACK_URL}} na wartość z C++
void handleIndex(){
  String html = FPSTR(PAGE_INDEX); //PAGE INDEX is taken from index.h
  html.replace("{{TRACK_URL}}", TRACK_URL);
  server.send(200, "text/html", html);
}

void handleState(){
  char buf[128];
  snprintf(buf,sizeof(buf),
    "{\"on\":%s,\"bright\":%u,\"color\":\"#%02x%02x%02x\"}",
    isOn?"true":"false", bright, currentColor.r, currentColor.g, currentColor.b);
  server.send(200,"application/json",buf);
}

void handleSet(){
  if(server.hasArg("on")) { isOn = (server.arg("on")=="1"||server.arg("on")=="true"); }
  if(server.hasArg("br")) { int b=server.arg("br").toInt(); if(b<1)b=1; if(b>255)b=255; bright=(uint8_t)b; }
  if(server.hasArg("color")){ CRGB c; if(parseHexColor(server.arg("color"), c)) currentColor=c; }
  applyLeds(); handleState();
}

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

void setup(){
  Serial.begin(115200);
  FastLED.addLeds<LED_TYPE, DATA_PIN, COLOR_ORDER>(leds, NUM_LEDS);
  FastLED.clear(true);
  FastLED.setBrightness(bright);

  connectWiFi();

  if (MDNS.begin(HOSTNAME)) {
    MDNS.addService("http","tcp",80);
    Serial.printf("mDNS OK: http://%s.local\n", HOSTNAME);
  } else {
    Serial.println("mDNS nie działa (Windows może wymagać Bonjour).");
  }

  server.on("/", handleIndex);
  server.on("/api/state", handleState);
  server.on("/api/set", handleSet);
  server.begin();
  Serial.println("HTTP server start");
  applyLeds();
}

void loop(){
  if (WiFi.status()!=WL_CONNECTED) connectWiFi();
  server.handleClient();
}
