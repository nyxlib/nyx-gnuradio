#!/bin/bash

npm run build && scp ./dist/index.js vps:/var/www/addons.nyxlib.org/addons/nyx-gnuradio/latest/ && tput bel
