const { v4: uuidv4 } = require('uuid');
var express = require("express"),
  cors = require("cors"),
  Busboy = require("busboy"),
  fs = require("fs"),
  inspect = require("util").inspect;
  // bodyParser = require('body-parser');
  
const { spawn } = require('child_process');

var app = express();
// app.use( bodyParser.json({limit: '50mb'}) );
// app.use(bodyParser.urlencoded({
//   limit: '50mb',
//   extended: true,
//   parameterLimit:50000
// }));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cors({
  origin: 'https://ainize.ai',
}));

var repo_dir = '.';

const conll_shorthands = ['af_afribooms', 'ar_padt', 'bg_btb', 'bxr_bdt', 'ca_ancora', 'cs_cac', 'cs_fictree', 'cs_pdt', 'cu_proiel', 'da_ddt', 'de_gsd', 'el_gdt', 'en_ewt', 'en_gum', 'en_lines', 'es_ancora', 'et_edt', 'eu_bdt', 'fa_seraji', 'fi_ftb', 'fi_tdt', 'fr_gsd', 'fro_srcmf', 'fr_sequoia', 'fr_spoken', 'ga_idt', 'gl_ctg', 'gl_treegal', 'got_proiel', 'grc_perseus', 'grc_proiel', 'he_htb', 'hi_hdtb', 'hr_set', 'hsb_ufal', 'hu_szeged', 'hy_armtdp', 'id_gsd', 'it_isdt', 'it_postwita', 'ja_gsd', 'kk_ktb', 'kmr_mg', 'ko_gsd', 'ko_kaist', 'la_ittb', 'la_perseus', 'la_proiel', 'lv_lvtb', 'nl_alpino', 'nl_lassysmall', 'no_bokmaal', 'no_nynorsklia', 'no_nynorsk', 'pl_lfg', 'pl_sz', 'pt_bosque', 'ro_rrt', 'ru_syntagrus', 'ru_taiga', 'sk_snk', 'sl_ssj', 'sl_sst', 'sme_giella', 'sr_set', 'sv_lines', 'sv_talbanken', 'tr_imst', 'ug_udt', 'uk_iu', 'ur_udtb', 'vi_vtb', 'zh_gsd']

//return (호출한 알고리즘)
function busboyFunc(req, res) {
  return new Promise((resolve, reject) => {
    let fileuploaded = true;
    var busboy = new Busboy({ headers: req.headers });
    let kind = undefined;
    uuid4 = uuidv4();
    busboy.on("file", function(fieldname, file, filename, encoding, mimetype) {
      if (filename === "") {
        fileuploaded = false;
      }
      file.pipe(fs.createWriteStream(__dirname + '/input_' + uuid4 + '.txt'));
    });

    busboy.on("field", function(fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
      if(val === 'undefined')
        fileuploaded = false;
      kind = inspect(val).substring(1, inspect(val).length - 1);
      console.log(val, kind)
    });

    busboy.on("finish", function() {
      if (!fileuploaded) {
        res.writeHead(400);
        res.end();
        return;
      }
      console.log("before resolve");
      resolve([uuid4, kind]);
    });
    
    req.pipe(busboy);
  }).then(function(data){
    uuid = data[0]
    kind = data[1]
    console.log("then " + uuid4);
    return [__dirname + '/input_' + uuid4 + '.txt', kind]
  })
}

app.post('/analyze', async (req, res) => {
  console.log('post /analyze')
  let is_form = false;

  const sentences = req.body.sentences

  if(sentences === undefined)
    is_form = true;
  console.log(sentences, is_form)

  let model_version, input_txt_path, ret;
  if(!is_form) 
    model_version = req.body.model_version
  else{
    [input_txt_path, model_version] = await busboyFunc(req, res)
    console.log(input_txt_path)
    console.log(model_version)
  }
  const splits = model_version.split('_')

  if(splits.length != 3 && !((splits[0] + '_' + splits[1]) in conll_shorthands)){
    console.log('ERROR : input \'_\' split length = ' + splits.length + ' or not valid format')
    // TODO: res error handling
    res.end()
    return;
  }

  const model = splits[0] + '_' + splits[1]
  
  ret = is_form ? await runPythonTXT(input_txt_path, model) : await runPython(sentences, model)
  try {
    res.json(ret);
  } catch (error) {
    console.log(error);
    res.writeHead(400);
    res.end();
  }
})

app.listen(80, () => {
  console.log("server connect");
});

const isJson = (str) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};

runPythonTXT = (input, model) => {
  return new Promise((resolve, reject) => {
    let size = 0;
    console.log(input)
    const stats = fs.statSync(input)
    console.log(stats['size'])
    if(stats['size'] > 10000) {
      reject(`${stats.size} too much size text file`)
      return;
    }

    console.log('after')
    let ret = ''
    let config = [
      repo_dir + "/pipeline_demo.py", 
      "--model", model,
      "--path", input,
    ]
    const pyProg = spawn('python', config)
    
    pyProg.stderr.on('data', (data) => {
      console.log("runpython return error : " + data.toString())
      resolve(data.toString())
    })

    pyProg.stdout.on('data', (data) =>
      ret += data
    )
    
    pyProg.on('exit', (code) =>{
      console.log('exit code : ' + code)
      if(isJson(ret))
        resolve(JSON.parse(ret))
      else resolve('')
    })
  }).catch((err) => {
    return err
  });
};

runPython = (input, model) => {
  return new Promise((resolve, reject) => {
    let ret = ''
    let config = [
      repo_dir + "/pipeline_demo.py", 
      "--model", model,
      "--input", input,
    ]
    const pyProg = spawn('python', config)
    
    pyProg.stderr.on('data', (data) => {
      console.log("runpython return error : " + data.toString())
      resolve('err')
    })

    pyProg.stdout.on('data', (data) =>
      ret += data
    )
    
    pyProg.on('exit', (code) =>{
      console.log('exit code : ' + code)
      if(isJson(ret))
        resolve(JSON.parse(ret))
      else resolve('')
    })
  })
};