const {
	hook_effect,
	hook_memo,
	hook_model,
	init,
	node_dom,
	node_map,
	node,
}=lui;

const model={
	init:()=>({
		translateTo: 1,
		view: "vocabularyList",
		vocabularyIndex: 0,
		vocabularyList: [{id: 0,lang0:["hello and Welcome"],lang1:["Hallo und Willkommen"]}],
		vocabularyListUrl: "vocs/unit1.vocs",
		points: 0,
	}),
	randomVocabularyIndex: state=>({
		...state,
		vocabularyIndex: pickItemIndex(state.vocabularyList),
	}),
	setVocabularyList:(state,vocabularyList)=>({
		...state,
		vocabularyList,
	}),
	setView:(state,view)=>({
		...state,
		view,
	}),
	addPoint: state=>({
		...state,
		points: state.points+1,
	}),
	resetPoints: state=>({
		...state,
		points: 0,
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
		//console.log(vocList);
		actions.setVocabularyList(vocList);
	}
}
function IndexVocabularyList({I:voc,actions}){
	//console.log(voc);
	return[
		lui.node_dom("p",{
			innerHTML: `${voc.lang0.join("<b style=color:green>;</b> ")} <b style=color:red>|</b> ${voc.lang1.join("<b style=color:green>;</b> ")}`
		})
	];
}
function pickItemIndex(array){
	const random=Math.floor(Math.random()*array.length);
	return Math.min(array.length-1,random);
}
function pickItem(array){
	return array[pickItemIndex(array)];
}
function ViewVocabularyTest({state,actions}){
	const vocabularyBlock=state.vocabularyList[state.vocabularyIndex];
	let askVocabulary=undefined;
	let translationVocabulary=undefined;
	if(state.translateTo){
		askVocabulary=vocabularyBlock.lang0;
		translationVocabulary=vocabularyBlock.lang1;
	}else{
		askVocabulary=vocabularyBlock.lang1;
		translationVocabulary=vocabularyBlock.lang0;
	}
	return[
		node_dom("h1[innerText=Übersetze!]"),
		node_dom("p",{
			innerHTML: "Übersetze: <b style=color:red>"+hook_memo(pickItem,[askVocabulary])+"</b>",
		}),
		node_dom("p",{
			innerHTML: "Punkte: <b style=color:green>"+state.points+"</b>",
		}),
		node_dom("form",{
			onsubmit: event=>{
				const answer=event.target.answer.value;
				event.target.answer.value="";

				const correct=translationVocabulary.some(item=>item===answer);
				if(correct){
					actions.addPoint();
					actions.randomVocabularyIndex();
				}
				else{
					if(!confirm(answer+" ist falsch!\n\nNochmal versuchen?")) {
						alert("Richtig wären: "+translationVocabulary.join("; "));
						actions.randomVocabularyIndex();
					}
				}
				return false;
			},
		},[
			node_dom("label[innerText=Antwort: ]",null,[
				node_dom("input[name=answer][autocomplete=off][required][autofocus][style=margin-right:10px]"),
			]),
			node_dom("button[innerText=Überprüfen]"),
		]),
		node_dom("p",null,[
			node_dom("a[href=#back][innerText=Zurück][style=margin-right:10px]",{
				onclick:()=>{
					actions.setView("vocabularyList");
					return false;
				},
			}),
			node_dom("a[href=#skip][innerText=Überspringen][style=margin-right:10px]",{
				onclick:()=>{
					actions.randomVocabularyIndex();
					return false;
				},
			}),
		]),
	];
}


init(()=>{
	const [state,actions]=hook_model(model);
	hook_effect(onVocUrlChange,[state.vocabularyListUrl,actions]);
	return[null,[
		state.view==="vocabularyList"&&
		node_dom("div",null,[
			node_dom("h1[innerText=Vokabeln]"),
			node_dom("p",{
				innerText:`Punkte: ${state.points}`,
			}),
			node_dom("button[innerText=Vokabeln abfragen!]",{
				onclick:()=>{
					if(state.vocabularyIndex===0) actions.randomVocabularyIndex();
					actions.setView("vocabularyTest");
				},
			}),
			node_map(IndexVocabularyList,state.vocabularyList,{actions}),
		]),
		state.view==="vocabularyTest"&&
		node(ViewVocabularyTest,{state,actions}),
	]];
});
