ARG VARIANT=20-bullseye
FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:0-${VARIANT}

# curl and ca-certificates are needed for volta installation
# Also, installing zsh
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends python-is-python3 python3-pip \
    && apt-get -y install --no-install-recommends magic-wormhole rsync iputils-ping curl wget zsh

RUN su node -c "pip install --user -U Commitizen"
RUN su node -c "npm install -g npm && npm install -g pm2 np tldr fkill"
RUN su node -c "npm install -g turbo next tsx"

RUN su node -c "curl -L https://git.io/antigen > ~/.antigen.zsh"

RUN echo '\n\
    source ~/.antigen.zsh \n\
    antigen use oh-my-zsh \n\
    antigen bundle git \n\
    antigen bundle bash \n\
    antigen bundle command-not-found \n\
    antigen bundle zsh-users/zsh-syntax-highlighting \n\
    antigen bundle zsh-users/zsh-autosuggestions \n\
    antigen theme spaceship-prompt/spaceship-prompt \n\
    antigen apply' > /home/node/.zshrc

RUN chown node /home/node/.zshrc
RUN chsh -s $(which zsh) node

# Needed by volta() function
ENV VOLTA_HOME /home/node/.volta
ENV PATH /home/node/.local/bin:${PATH}

# Make sure packages managed by volta will be in PATH
ENV PATH $VOLTA_HOME/bin:$PATH

# Install volta as node user
USER node
RUN curl https://get.volta.sh | bash
RUN chown node /home/node/.volta

RUN volta install node@20

USER root

RUN groupadd docker && usermod -aG docker node
