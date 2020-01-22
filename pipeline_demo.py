import sys
import argparse
import io
import json
import stanfordnlp

if __name__ == '__main__':
    # get arguments
    parser = argparse.ArgumentParser()
    parser.add_argument('-d', '--models_dir', help='location of models files | default: ./models/', default='./models')
    parser.add_argument('-m', '--model', help='lang_treebank', default="ko")
    parser.add_argument('-i', '--input', help='sentences', default='')
    args = parser.parse_args()

    lang, treebank = args.model.split('_')
    
    sentences = { lang : args.input }
    if len(sentences[lang]) == 0 :
        print(json.dumps({}, ensure_ascii=False))
        exit()
    
    text_trap = io.StringIO()
    sys.stdout = text_trap
    sys.stderr = text_trap
    
    conll = args.model
    # set up a pipeline
    pipeline = stanfordnlp.Pipeline(models_dir=args.models_dir, lang=lang, treebank=conll, use_gpu=False)
    
    # process the document
    doc = pipeline(sentences[lang])

    obj = { }
    
    for scnt, sentence in enumerate(doc.sentences):
        obj[scnt] = []
        for wcnt, word in enumerate(sentence.words):
            temp = {
                'index' : int(word.index),
                'word' : word.text,
                'lemma' : word.lemma,
                'upos' : word.upos,
                'xpos' : word.xpos,
                'feats' : word.feats,
                'governor_index' : word.governor,
                'governor' : (sentence.words[word.governor-1].text if word.governor > 0 else 'root'),
                'dependecy_relation' : word.dependency_relation,
                #'parent_token' : word.parent_token,
            }
            obj[scnt].append(temp)

    sys.stdout = sys.__stdout__        
    print(json.dumps(obj, ensure_ascii=False))