#!/bin/sh
set -eu

CATALINA_HOME="${CATALINA_HOME:-/usr/local/tomcat}"
PORT="${PORT:-8080}"
DB_URL="${DB_URL:-jdbc:h2:file:/data/keerthanyamart}"
DB_USER="${DB_USER:-sa}"
DB_PASSWORD="${DB_PASSWORD:-}"
SEED_DEMO_DATA="${SEED_DEMO_DATA:-false}"

mkdir -p /data

if [ ! -f /data/keerthanyamart.mv.db ]; then
    echo "Initializing KeerthanyaMart database..."

    if [ "$SEED_DEMO_DATA" = "true" ]; then
        : "${ADMIN_PASSWORD:?Set ADMIN_PASSWORD before enabling SEED_DEMO_DATA}"

        (
            cd /opt/keerthanyamart
            java -Djdbc.url="$DB_URL" \
                -cp "/opt/keerthanyamart/WEB-INF/classes:/opt/keerthanyamart/WEB-INF/lib/*" \
                com.keerthanya.keerthanyamart.util.DbSeeder
        )
    else
        java -cp "/opt/keerthanyamart/WEB-INF/lib/*" \
            org.h2.tools.RunScript \
            -url "$DB_URL" \
            -user "$DB_USER" \
            -password "$DB_PASSWORD" \
            -script /opt/keerthanyamart/db/schema.sql
    fi
fi

sed -i "s/port=\"8080\"/port=\"$PORT\"/" "$CATALINA_HOME/conf/server.xml"

exec "$CATALINA_HOME/bin/catalina.sh" run
