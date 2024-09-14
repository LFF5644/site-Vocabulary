const {
	hook_effect,
	hook_memo,
	hook_model,
	init,
	node_dom,
	node_map,
	node,
}=lui;

function newId(){
	if(!window.idCount) window.idCount=0;
	window.idCount+=1;
	return window.idCount;
}

const model={
	init:()=>({
		translateTo: 1,
		view: "vocabularyList",
		vocabularyIndex: 0,
		//vocabularyList: [{id: 0,lang0:["hello and Welcome"],lang1:["Hallo und Willkommen"]}],
		//vocabularyListUrl: "vocs/unit1.vocs",
		vocabularyLists: [
			{
				id: newId(),
				url: "vocs/unit2.vocs",
				label: "Unit 2 (Klasse 9 HSTO)",
				//vocabularyList: [], // Auto Generate!
				vocabularyList: null,
			},
			{
				id: newId(),
				url: "vocs/unit1.vocs",
				label: "Unit 1",
				//vocabularyList: [], // Auto Generate!
				vocabularyList: null,
			},
		],
		vocabularyListId: -1,
		points: 0,
	}),
	randomVocabularyIndex: state=>({
		...state,
		vocabularyIndex: pickItemIndex(state.vocabularyLists.find(item=>item.id===state.vocabularyListId).vocabularyList),
	}),
	setVocabularyList:(state,id,vocabularyList)=>({
		...state,
		vocabularyLists: state.vocabularyLists.map(item=>
			item.id!==id?item:{
				...item,
				id: item.id,
				vocabularyList,
			}
		),
	}),
	setVocabularyListId:(state,vocabularyListId)=>({
		...state,
		vocabularyListId,
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
function download(url,func,...args){
	fetch(url)
		.then(res=>res.text())
		.then(res=>func(res,...args))
	;
}
function checkForDownloadVocList(vocabularyListId,vocabularyLists,actions){
	if(vocabularyListId===-1) return;
	const entry=vocabularyLists.find(item=>item.id===vocabularyListId);
	if(entry.vocabularyList) return;

	console.log("checkForDownloadVocList:",vocabularyListId,vocabularyLists);
	onVocUrlChange({
		url: entry.url,
		id: entry.id,
	},actions);
}
function onVocUrlChange(data,actions,receive=false,id){
	if(!receive){
		if(window.indexMode==="live"){data.url="/p/Vocabulary/"+data.url;}
		else{data.url="https://lff.one/p/Vocabulary/"+data.url;}
		download(data.url,onVocUrlChange,actions,true,data.id);
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
			console.log(vocabularyLine);
		}
		console.log("Downloaded Vocabulary List for ID: "+id+", with "+vocList.length+" Vocabularies.");

		actions.setVocabularyList(id,vocList);
	}
}
function IndexVocabulary({I:voc}){
	//console.log(voc);
	return[
		node_dom("p",{
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
	console.log(state.vocabularyLists.find(item=>item.id===state.vocabularyListId));
	const vocabularyBlock=state.vocabularyLists.find(item=>item.id===state.vocabularyListId).vocabularyList[state.vocabularyIndex];
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

				const correct=translationVocabulary.some(item=>item.toLowerCase()===answer.toLowerCase());
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
				node_dom("input[name=answer][autocomplete=off][type=text][required][autofocus][style=margin-right:5px]"),
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
function IndexVocabularyLists({I:entry,currentVocList}){
	return[
		node_dom("option",{
			innerText: entry.label,
			selected: entry.id===currentVocList,
			value: entry.id,
		}),
	];
}


init(()=>{
	const [state,actions]=hook_model(model);
	newId();
	hook_effect(checkForDownloadVocList,[state.vocabularyListId,state.vocabularyLists,actions]);
	return[null,[
		state.view==="vocabularyList"&&
		node_dom("div",null,[
			node_dom("h1[innerText=Vokabeln]"),
			node_dom("p",{
				innerText:`Punkte: ${state.points}`,
			}),
			node_dom("select",{
				onchange: event=>{
					const newValue=Number(event.target.value);
					console.log(newValue);
					actions.setVocabularyListId(newValue);
				},
			},[
				node_map(IndexVocabularyLists,state.vocabularyLists,{currentVocList:state.vocabularyListId}),
				
				state.vocabularyListId===-1&&
				node_dom("option[value=-1][innerText=Vokabeln auswählen]"),
			]),
			node_dom("button[innerText=Vokabeln abfragen!]",{
				disabled: (
					state.vocabularyListId===-1||
					state.vocabularyLists.find(item=>item.id===state.vocabularyListId).vocabularyList===null
				),
				onclick:()=>{
					if(state.vocabularyId===0) actions.randomVocabularyId();
					actions.setView("vocabularyTest");
				},
			}),

			state.vocabularyListId===-1&&
			node_dom("p[innerText=Bitte Vokabel-Liste auswählen]"),

			state.vocabularyListId!==-1&&
			state.vocabularyLists.find(item=>item.id===state.vocabularyListId).vocabularyList===null&&
			node_dom("div",null,[
				node_dom("p[innerText=Vokabel-Liste wird heruntergeladen bitte warten...]"),
				node_dom("progress"),
			]),

			state.vocabularyListId!==-1&&
			state.vocabularyLists.find(item=>item.id===state.vocabularyListId).vocabularyList!==null&&
			node_map(IndexVocabulary,state.vocabularyLists.find(item=>item.id===state.vocabularyListId).vocabularyList,{actions}),
		]),
		state.view==="vocabularyTest"&&
		node(ViewVocabularyTest,{state,actions}),
	]];
});
