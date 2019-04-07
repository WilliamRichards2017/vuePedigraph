

function mockAffected(threshold){
  let i = Math.random();

  if(i < threshold){
    return 2;
  }
  else{
    return 0;
  }
}

function mockAlleles(threshold){

  let alleles = "";

  let a1T = Math.random();
  let a2T = Math.random();

  if(a1T < threshold){
    alleles += '1/'
  }
  else{
    alleles += '0/'
  }
  if(a2T < threshold){
    alleles += '1'
  }
  else{
    alleles += '0'
  }
  return alleles;

}

function getPhenotypeLikelyhood(phenotype){
  if(phenotype==="Diabetes"){
    return 0.2
  }
  else if(phenotype==="Cancer"){
    return 0.5
  }
  else if(phenotype === "Familial pancreatic carcinoma"){
    return 0.3
  }

  else{
    return 0
  }

}


export {mockAffected, mockAlleles, getPhenotypeLikelyhood};
