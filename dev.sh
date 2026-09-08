#!/bin/sh
# Nothing inside the containers can see the LAN address a phone would dial —
# they only get Docker's bridge network — so resolve it out here and pass it
# down for the control-panel QR code. Override by exporting CONTROL_HOST.
if [ -z "$CONTROL_HOST" ]; then
	CONTROL_HOST=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null)
fi
if [ -z "$CONTROL_HOST" ]; then
	CONTROL_HOST=$(hostname -I 2>/dev/null | awk '{print $1}')
fi
export CONTROL_HOST

echo "control host: ${CONTROL_HOST:-<unresolved, set it in the QR popover>}"
docker compose up --build --watch
