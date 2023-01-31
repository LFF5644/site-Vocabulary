const model={
	init:()=>({
		vocabularyIndex:0,
		vocabularyListUrl:"s190-191.vocs",
		vocabularyList:["$description: Demo","hello|Hallo"],
	}),
	changeVocabularyIndex:(state,vocabularyIndex)=>pushToObject([
		state,
		{vocabularyIndex},
	]),
	changeVocabularyList:(state,vocList)=>pushToObject([
		state,
		{vocabularyList:vocList},
	]),
};
function download(url,func,args0,args1,args2){
	fetch(url)
		.then(res=>res.text())
		.then(res=>func(res,args0,args1,args2))
}
function onVocUrlChange(data,actions,receive=false){
	if(!receive){
		if(window.indexMode=="live"){data="/p/Vocabulary/"+data;}
		else{data="https://lff.l3p3.de/p/Vocabulary/"+data;}
		download(data,onVocUrlChange,actions,true);
	}else if(receive){
		const vocList=[];
		const ignoreChars=[
			"//",
			"#",
		];
		let line="";
		for(line of data.split("\n")){
			if(ignoreChars.some(item=>line.startsWith(item))||!line){
				continue;
			}
			vocList.push(line);
		}
		actions.changeVocabularyList(vocList);
	}
}
function pushToObject(objects){
	const resultObject=new Object();
	let o={};
	for(o of objects){
		const keysInObject=Object.keys(o);
		for(key of keysInObject){
			resultObject[key]=o[key];
		}
	}
	return resultObject;
}
function IndexVocabularyList({I:voc,actions}){
	console.log(voc)
	return[
		lui.node_dom("p",{
			innerText:voc,
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
			node_dom("h1[innerText=Vocabeln Werden Hier Später erscheinen!]"),
			node_dom("p[innerText=Aber es functonirt alles (sugar noch unter window xp von 2001 !)]"),
			node_dom("p",{
				innerText:`Vocabel: ${state.vocabularyIndex}`,
			}),
			node_dom("button[innerText=CLICK!]",{
				onclick:()=>{actions.changeVocabularyIndex('DONT CLICK ME!')}
			}),
			node_map(IndexVocabularyList,state.vocabularyList,{actions}),
		]];
	});
}//END OF MAIN!;
