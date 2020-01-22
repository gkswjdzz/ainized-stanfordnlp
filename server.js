var express = require("express"),
  cors = require("cors");
  
const { spawn } = require('child_process');

var app = express();
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cors({
  origin: 'https://ainize.ai',
}));

var repo_dir = '.';

const conll_shorthands = ['af_afribooms', 'ar_padt', 'bg_btb', 'bxr_bdt', 'ca_ancora', 'cs_cac', 'cs_fictree', 'cs_pdt', 'cu_proiel', 'da_ddt', 'de_gsd', 'el_gdt', 'en_ewt', 'en_gum', 'en_lines', 'es_ancora', 'et_edt', 'eu_bdt', 'fa_seraji', 'fi_ftb', 'fi_tdt', 'fr_gsd', 'fro_srcmf', 'fr_sequoia', 'fr_spoken', 'ga_idt', 'gl_ctg', 'gl_treegal', 'got_proiel', 'grc_perseus', 'grc_proiel', 'he_htb', 'hi_hdtb', 'hr_set', 'hsb_ufal', 'hu_szeged', 'hy_armtdp', 'id_gsd', 'it_isdt', 'it_postwita', 'ja_gsd', 'kk_ktb', 'kmr_mg', 'ko_gsd', 'ko_kaist', 'la_ittb', 'la_perseus', 'la_proiel', 'lv_lvtb', 'nl_alpino', 'nl_lassysmall', 'no_bokmaal', 'no_nynorsklia', 'no_nynorsk', 'pl_lfg', 'pl_sz', 'pt_bosque', 'ro_rrt', 'ru_syntagrus', 'ru_taiga', 'sk_snk', 'sl_ssj', 'sl_sst', 'sme_giella', 'sr_set', 'sv_lines', 'sv_talbanken', 'tr_imst', 'ug_udt', 'uk_iu', 'ur_udtb', 'vi_vtb', 'zh_gsd']

app.post('/analyze', async (req, res) => {
  console.log('post /analyze')
  const model_version = req.body.model_version
  const sentences = req.body.sentences
  const splits = model_version.split('_')

  if(splits.length != 3 && !((splits[0] + '_' + splits[1]) in conll_shorthands)){
    console.log('ERROR : input \'_\' split length = ' + splits.length + ' or not valid format')
    // TODO: res error handling
    res.end()
  }
  
  const model = splits[0] + '_' + splits[1]
  ret = await runPython(sentences, model)
  res.json(ret)
})

app.listen(80, () => {
  console.log("server connect");
});

//run python except densepose
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
      resolve(data.toString())
    })

    pyProg.stdout.on('data', (data) =>
      ret += data
    )
    
    pyProg.on('exit', (code) =>{
      console.log('exit code : ' + code)
      resolve(JSON.parse(ret))
    })
  })
};