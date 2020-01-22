FROM rackspacedot/python37:latest

CMD ["bash"]

# Install Node.js 8 and npm 5
RUN apt-get update
RUN apt-get -y install curl gnupg
RUN curl -sL https://deb.nodesource.com/setup_11.x  | bash -
RUN apt-get -y install nodejs

RUN pip install stanfordnlp

COPY model_download.py .
RUN mkdir /models
RUN python model_download.py

COPY package.json .
RUN npm install

COPY pipeline_demo.py .
COPY server.js .

EXPOSE 80
ENTRYPOINT node server.js