FROM nvidia/cuda:10.0-cudnn7-devel
ENV LC_ALL=C.UTF-8

CMD ["bash"]

# Install Node.js 8 and npm 5
RUN apt-get update
RUN apt-get -y install curl gnupg
RUN curl -sL https://deb.nodesource.com/setup_12.x  | bash -
RUN apt-get -y install nodejs

RUN apt-get update && apt-get install -y python3-dev git wget

RUN wget https://bootstrap.pypa.io/get-pip.py
RUN python3 get-pip.py
RUN rm get-pip.py

RUN pip install stanfordnlp

RUN update-alternatives --install /usr/bin/python python /usr/bin/python2.7 1
RUN update-alternatives --install /usr/bin/python python /usr/bin/python3.6 2
RUN python --version

COPY model_download.py .
RUN mkdir /models
RUN python model_download.py

COPY package.json .
RUN npm install

COPY pipeline_demo_gpu.py ./pipeline_demo.py
COPY server.js .

EXPOSE 80
ENTRYPOINT node server.js