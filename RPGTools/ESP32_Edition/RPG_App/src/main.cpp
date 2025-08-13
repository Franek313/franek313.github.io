#include <WiFi.h>
#include <WebServer.h>
#include <ESPmDNS.h>
#include <FastLED.h>
#include "index.h"

// ====== Twoje Wi-Fi ======
const char* WIFI_SSID = "Dom Frania 2.4G";
const char* WIFI_PASS = "franekfranek";
const char* HOSTNAME  = "rpgeffects";   // -> http://rpgeffects.local

// ====== LED strip (jak u Ciebie) ======
#define DATA_PIN     13
#define NUM_LEDS     60
#define LED_TYPE     WS2812B
#define COLOR_ORDER  GRB
CRGB leds[NUM_LEDS];
bool     isOn   = false;
uint8_t  bright = 128;
CRGB     currentColor = CRGB::White;

// ====== My LED color variables ===== 
CRGB targetColor = currentColor;
uint8_t targetBright = bright;

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

void handleState(){
  char buf[128];
  snprintf(buf,sizeof(buf),
    "{\"on\":%s,\"bright\":%u,\"color\":\"#%02x%02x%02x\"}",
    isOn?"true":"false", bright, currentColor.r, currentColor.g, currentColor.b);
  server.send(200,"application/json",buf);
}

void handleSet(){
  if(server.hasArg("on"))  
    isOn = (server.arg("on")=="1"||server.arg("on")=="true");
  
  if(server.hasArg("br"))  {
    int b = server.arg("br").toInt();
    if (b < 0) b = 0;
    if (b > 255) b = 255;
    targetBright = (uint8_t)b;
  }
  
  if(server.hasArg("color")){
    CRGB c;
    if(parseHexColor(server.arg("color"), c))
      targetColor = c;
  }

  handleState(); // odsyła nowy stan, ale jeszcze nie zmienia LEDów natychmiast
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

  server.on("/api/state", handleState);
  server.on("/api/set", handleSet);
  server.begin();
  Serial.println("HTTP server start");
  applyLeds();
}

void loop(){
  if (WiFi.status()!=WL_CONNECTED) connectWiFi();
  server.handleClient();

  // Smooth fade kolorów
  if (currentColor != targetColor || bright != targetBright) {
    // krok po kolorze
    currentColor.r = lerp8by8(currentColor.r, targetColor.r, 20); // 20 = szybkość
    currentColor.g = lerp8by8(currentColor.g, targetColor.g, 20);
    currentColor.b = lerp8by8(currentColor.b, targetColor.b, 20);
    // krok po jasności
    bright = lerp8by8(bright, targetBright, 20);
    applyLeds();
  }
}
