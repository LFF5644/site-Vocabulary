const model={
	init:()=>({
		vocabularyIndex: -1,
		vocabularyListUrl: "s190-191.vocs",
		vocabularyList: [{id: 0,lang0:["hello and Welcome"],lang1:["Hallo und Willkommen"]}],
	}),
	setVocabularyIndex:(state,vocabularyIndex)=>({
		...state,
		vocabularyIndex,
	}),
	setVocabularyList:(state,vocabularyList)=>({
		...state,
		vocabularyList,
	}),
};
function newId(){
	if(!window.idCount) idCount=0;
	window.idCount+=1;
	return idCount;
}
function download(url,func,args0,args1,args2){
	fetch(url)
		.then(res=>res.text())
		.then(res=>func(res,args0,args1,args2))
}
function onVocUrlChange(data,actions,receive=false){
	if(!receive){
		if(window.indexMode=="live"){data="/p/Vocabulary/"+data;}
		else{data="https://lff.one/p/Vocabulary/"+data;}
		download(data,onVocUrlChange,actions,true);
	}else if(receive){
		const vocList=[];
		const ignoreChars=[
			"//",
			"#",
			"$",
		];
		for(const line of data.split("\n").map(item=>item.trim())){
			if(ignoreChars.some(item=>line.startsWith(item))||!line){
				continue;
			}
			//console.log(line);
			let vocabularyLine=[];
			for(const vocabularies of line.split("|").map(item=>item.trim())){
				//console.log(vocabularies);
				let push=[];
				if(vocabularies.includes(";")) push=vocabularies.split(";").map(item=>item.trim());
				else push=[vocabularies];
				vocabularyLine.push(push);
			}
			if(vocabularyLine.length!==2) continue;
			vocabularyLine={
				id: newId(),
				lang0: vocabularyLine[0],
				lang1: vocabularyLine[1],
			};
			vocList.push(vocabularyLine);
		}
		console.log(vocList);
		actions.setVocabularyList(vocList);
	}
}
function IndexVocabularyList({I:voc,actions}){
	console.log(voc);
	return[
		lui.node_dom("p",{
			innerText: voc.lang0.join("; ")+" | "+voc.lang1.join("; ")
		})
	];
}

function main(){
	const {
		init,
	//	node,
		node_dom,
		node_map,
		hook_model,
		hook_effect,
	}=lui;

	init(()=>{
		const [state,actions]=hook_model(model);
		hook_effect(onVocUrlChange,[state.vocabularyListUrl,actions])
		return[null,[
			node_dom("h1[innerText=Vokabeln Werden Hier Später erscheinen!]"),
			node_dom("p",{
				innerText:`Vokabel: ${state.vocabularyIndex}`,
			}),
			node_dom("button[innerText=CLICK!]",{
				onclick:()=>{actions.setVocabularyIndex("DON'T CLICK ME!")}
			}),
			node_map(IndexVocabularyList,state.vocabularyList,{actions}),
		]];
	});
}//END OF MAIN!;
