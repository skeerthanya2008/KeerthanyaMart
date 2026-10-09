FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /workspace
COPY pom.xml .
COPY src ./src
COPY db ./db

RUN mvn -B clean verify
RUN mkdir -p /tmp/unpacked \
    && cd /tmp/unpacked \
    && jar -xf /workspace/target/keerthanyamart.war

FROM tomcat:9-jdk17-temurin

ENV CATALINA_HOME=/usr/local/tomcat
ENV DB_URL=jdbc:h2:file:/data/keerthanyamart
ENV DB_USER=sa
ENV SEED_DEMO_DATA=false

USER root
WORKDIR /usr/local/tomcat

RUN rm -rf /usr/local/tomcat/webapps/*

COPY --from=build /workspace/target/keerthanyamart.war /usr/local/tomcat/webapps/ROOT.war
COPY --from=build /tmp/unpacked/WEB-INF/classes /opt/keerthanyamart/WEB-INF/classes
COPY --from=build /tmp/unpacked/WEB-INF/lib /opt/keerthanyamart/WEB-INF/lib
COPY db /opt/keerthanyamart/db
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 8080
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
