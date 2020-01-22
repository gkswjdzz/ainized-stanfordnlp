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

const default_treebanks = {'af': 'af_afribooms', 'grc': 'grc_proiel', 'ar': 'ar_padt', 'hy': 'hy_armtdp', 'eu': 'eu_bdt', 'bg': 'bg_btb', 'bxr': 'bxr_bdt', 'ca': 'ca_ancora', 'zh': 'zh_gsd', 'hr': 'hr_set', 'cs': 'cs_pdt', 'da': 'da_ddt', 'nl': 'nl_alpino', 'en': 'en_ewt', 'et': 'et_edt', 'fi': 'fi_tdt', 'fr': 'fr_gsd', 'gl': 'gl_ctg', 'de': 'de_gsd', 'got': 'got_proiel', 'el': 'el_gdt', 'he': 'he_htb', 'hi': 'hi_hdtb', 'hu': 'hu_szeged', 'id': 'id_gsd', 'ga': 'ga_idt', 'it': 'it_isdt', 'ja': 'ja_gsd', 'kk': 'kk_ktb', 'ko': 'ko_kaist', 'kmr': 'kmr_mg', 'la': 'la_ittb', 'lv': 'lv_lvtb', 'sme': 'sme_giella', 'no_bokmaal': 'no_bokmaal', 'no_nynorsk': 'no_nynorsk', 'cu': 'cu_proiel', 'fro': 'fro_srcmf', 'fa': 'fa_seraji', 'pl': 'pl_lfg', 'pt': 'pt_bosque', 'ro': 'ro_rrt', 'ru': 'ru_syntagrus', 'sr': 'sr_set', 'sk': 'sk_snk', 'sl': 'sl_ssj', 'es': 'es_ancora', 'sv': 'sv_talbanken', 'tr': 'tr_imst', 'uk': 'uk_iu', 'hsb': 'hsb_ufal', 'ur': 'ur_udtb', 'ug': 'ug_udt', 'vi': 'vi_vtb'}
const conll_shorthands = ['af_afribooms', 'ar_padt', 'bg_btb', 'bxr_bdt', 'ca_ancora', 'cs_cac', 'cs_fictree', 'cs_pdt', 'cu_proiel', 'da_ddt', 'de_gsd', 'el_gdt', 'en_ewt', 'en_gum', 'en_lines', 'es_ancora', 'et_edt', 'eu_bdt', 'fa_seraji', 'fi_ftb', 'fi_tdt', 'fr_gsd', 'fro_srcmf', 'fr_sequoia', 'fr_spoken', 'ga_idt', 'gl_ctg', 'gl_treegal', 'got_proiel', 'grc_perseus', 'grc_proiel', 'he_htb', 'hi_hdtb', 'hr_set', 'hsb_ufal', 'hu_szeged', 'hy_armtdp', 'id_gsd', 'it_isdt', 'it_postwita', 'ja_gsd', 'kk_ktb', 'kmr_mg', 'ko_gsd', 'ko_kaist', 'la_ittb', 'la_perseus', 'la_proiel', 'lv_lvtb', 'nl_alpino', 'nl_lassysmall', 'no_bokmaal', 'no_nynorsklia', 'no_nynorsk', 'pl_lfg', 'pl_sz', 'pt_bosque', 'ro_rrt', 'ru_syntagrus', 'ru_taiga', 'sk_snk', 'sl_ssj', 'sl_sst', 'sme_giella', 'sr_set', 'sv_lines', 'sv_talbanken', 'tr_imst', 'ug_udt', 'uk_iu', 'ur_udtb', 'vi_vtb', 'zh_gsd']

app.post('/:lang', async (req, res) => {
  const lang = req.params.lang

  if(!(lang in default_treebanks)){
    // TODO: res error handling
    res.end()
  }

  ret = await runPython(req.body.sentences, lang, undefined)
  res.json(ret)
})
app.post('/:lang/:treebank', async (req, res) => {
  const lang = req.params.lang;
  const treebank = req.params.treebank;

  if(!(lang in default_treebanks) && !((lang + '_' + treebank) in conll_shorthands)){
    // TODO: res error handling
    res.end()
  }

  ret = await runPython(req.body.sentences, lang, treebank)
  res.json(ret)
})

app.listen(80, () => {
  console.log("server connect");
});

//run python except densepose
runPython = (input, lang, treebank) => {
  return new Promise((resolve, reject) => {
    let ret = '';
    let config = [
      repo_dir + "/pipeline_demo.py", 
      "--lang", lang,
      "--input", input,
    ]
    if(treebank) config.push("--treebank", treebank)
    const pyProg = spawn('python', config);
    
    pyProg.stderr.on('data', (data) => 
      resolve(data.toString())
      );
    pyProg.stdout.on('data', (data) =>
      ret += data
    )
    pyProg.on('exit', (code) =>
      resolve(JSON.parse(ret))
    )
  })
};