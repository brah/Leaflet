#!/usr/bin/env bash

./build.sh

(cd ../../web/maphub_web/node_modules/leaflet || exit

 rm -r dist
 ln -s ../../../../leaflet/Leaflet/dist dist

 rm -r src
 ln -s ../../../../leaflet/Leaflet/src src
)

touch ../../web/maphub_web/js/app.js
