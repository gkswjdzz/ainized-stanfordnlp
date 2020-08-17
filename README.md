[![Run on Ainize](https://ainize.ai/static/images/run_on_ainize_button.svg)](https://ainize.web.app/redirect?git_repo=https://github.com/gkswjdzz/ainized-stanfordnlp)

# Ainized-StanfordNLP

This repository provides API server using [stanfordNLP](https://stanfordnlp.github.io/stanfordnlp/) that contains tools for robust text analytics, including tokenization, multi-word token (MWT) expansion, lemmatization, part-of-speech (POS) and morphological features tagging and dependency parsing. 

# How to Deploy

Since docker image exceeds 20GB, I recommend using a API server on ainize.

## Docker run

```
docker pull gkswjdzz/ainized-stanfordnlp
docker run -p 80:80 -t gkswjdzz/ainized-stanfordnlp
```
api server will be running on localhost.

# How to Query

## On Ainize


<img src="https://raw.githubusercontent.com/gkswjdzz/ainized-stanfordnlp/master/images/image1-1.png" width="700" />

First, select language that you are trying to use.

<img src="https://raw.githubusercontent.com/gkswjdzz/ainized-stanfordnlp/master/images/image2.png" width="700" />

then, write the sentences you want to analyze.

<img src="https://raw.githubusercontent.com/gkswjdzz/ainized-stanfordnlp/master/images/image3.png" width="700" />

Wait a few seconds, the results come back.

## On Local
```
curl -X POST "http://localhost/analyze" -H "accept: application/json" \
-H "Content-Type: application/x-www-form-urlencoded" \
-d "model_treebank={languages_treebank} sentences={sentences}"
```

You can see the detail of models for human languages from [here](https://stanfordnlp.github.io/stanfordnlp/models.html).

# References

[StanfordNLP](https://stanfordnlp.github.io/stanfordnlp/)
