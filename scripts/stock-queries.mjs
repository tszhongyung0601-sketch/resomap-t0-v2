/**
 * What to search Pexels for, one line per provider.
 *
 * Derived queries did not survive contact with a real search index: "Han
 * Taiwanese man in his early fifties, stocky, navy driver polo, hillside
 * pull-in above Jiufen" returns nothing, because a stock library is indexed on
 * three or four words, not on a paragraph. So these are hand-written, short,
 * and ordered the way the index rewards — subject first, then the one detail
 * that matters most.
 *
 * They still come from the same casting the drawings use, so the person who
 * arrives is the age and gender the prompt describes. What a stock library
 * cannot give is the place: there is no photograph of a sixty-something Amis
 * guide on the Sanxiantai tide shelf at 04:30, so 和美山, 太魯閣 and 七星潭 all
 * become "outdoors". That trade is the whole point of the exchange — the person
 * becomes real and the location becomes generic — and it is worth writing down
 * rather than discovering later.
 */
export const QUERIES = {
  /* ---------------------------------------------------------- 包車司機 */
  "p-acheng": "mature asian man van driver",
  "p-xiaofang": "asian woman driver van smiling",
  "p-dabear": "asian man cap driving van",
  "p-fucheng-car": "senior asian man shirt outdoors",
  "p-hualien-car": "young asian man coast outdoors",
  "p-akai": "young asian man hoodie city night",
  "p-ruifang-car": "asian man sunglasses driver car",
  "p-tamsui-car": "asian man bucket hat seaside",
  "p-taichung-car": "asian man uniform shirt bus driver",
  "p-kaohsiung-car": "elderly asian man cap harbour",
  "p-jiaoxi-car": "asian man fleece jacket mountain",
  "p-taitung-car": "asian man work shirt countryside",
  "p-chishang-car": "elderly asian farmer hat field",
  "p-chenggong-car": "asian man cap sunrise coast",
  "p-guangfu-car": "asian man tshirt outdoors field",
  "p-taroko-car": "asian man work shirt canyon",
  "p-yehliu-car": "asian woman standing beside van",
  "p-qingshui-car": "asian man polo shirt fishing harbour",
  "p-luodong-car": "asian woman polo shirt harbour",
  "p-qixingtan-car": "elderly asian man beanie glasses",

  /* ---------------------------------------------------------- 私人導遊 */
  "p-xiaomi": "asian woman tour guide old street",
  "p-azhe": "asian man glasses vest guide",
  "p-ada": "asian woman short hair city guide",
  "p-tainan-guide": "asian woman mature temple travel",
  "p-hualien-guide": "asian woman hiking guide forest",
  "p-jiufen-guide": "elderly asian man jacket old street",
  "p-tamsui-guide": "asian woman holding map outdoors",
  "p-taichung-guide": "young asian man glasses market",
  "p-kaohsiung-guide": "mature asian woman polo shirt guide",
  "p-jiaoxi-guide": "asian man hiking trail guide",
  "p-luodong-guide": "young asian woman night market",
  "p-taitung-guide": "asian man beard guitar outdoors",
  "p-hualien-city-guide": "asian woman night market street food",
  "p-chishang-guide": "asian woman farmer rice field",
  "p-chenggong-guide": "elderly asian woman working outdoors",
  "p-guangfu-guide": "asian woman wetland nature",
  "p-yehliu-guide": "asian man sun hat field vest",
  "p-pingxi-guide": "asian man cap railway station",
  "p-gaomei-guide": "asian woman binoculars nature watching",
  "p-qixingtan-guide": "asian woman windbreaker beach wind",
};
