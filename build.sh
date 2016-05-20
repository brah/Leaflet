#!/usr/bin/env bash

node_modules/.bin/jake build
mv dist/leaflet-src.js dist/leaflet-src.txt
rm -f dist/leaflet-src.map dist/leaflet.js


