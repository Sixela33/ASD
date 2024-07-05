ARG ALPINE_VERSION
FROM alpine:${ALPINE_VERSION}
ARG TARGETARCH

ADD shell_scripts/install.sh install.sh
RUN sh install.sh && rm install.sh

ADD shell_scripts/run.sh run.sh
ADD shell_scripts/env.sh env.sh
ADD shell_scripts/backup.sh backup.sh
ADD shell_scripts/restore.sh restore.sh

CMD ["sh", "run.sh"]
