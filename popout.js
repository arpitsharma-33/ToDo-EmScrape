
// create-todo <-- create todo button onclick open ".new-item"
// new-item <-- button pressed it save & hide

document.querySelector('.create-todo').addEventListener('click', function(){
    document.querySelector('.new-item').style.display='block';
});

document.querySelector('.new-item button')
.addEventListener('click',async function(){
    var itemName = document.querySelector('.new-item input').value;
    if(itemName != ''){
  
     // var itemsStorage = localStorage.getItem('todo-items');
      const storage = await chrome.storage.local.get('todo-items');
      console.log({store: storage["todo-items"] });
      var itemsArr = JSON.parse(storage["todo-items"] || "[]");
      itemsArr.push({"item":itemName, "status":0});
      await saveItems(itemsArr);
      fetchItems();
      document.querySelector('.new-item input').value='';
      document.querySelector('.new-item').style.display='none';
    }
  });
  
  

async function fetchItems(){

    const itemsList = document.querySelector('ul.todo-items');
    itemsList.innerHTML = " ";
    var newItemHTML = " ";

    try{

        const storage = await chrome.storage.local.get("todo-items");
        console.log({ store: storage["todo-items"] });
        var itemsArr = JSON.parse(storage["todo-items"] || "[]");


        for (var i = 0; i < itemsArr.length; i++) {

            var status = "";
            if(itemsArr[i].status == 1){
                status = 'class="done"';
            }

            newItemHTML += `<li data-itemindex = "${i}" ${status}>
                <span class="item">${itemsArr[i].item}</span>  
                <div>
                    <span class="itemComplete">✅</span> 
                    <span class="itemDelete">🗑️</span>
                </div>
            </li>`;
        }

        itemsList.innerHTML = newItemHTML;

       var itemsListUL =  document.querySelectorAll("ul li");
       for(var i =0; i<itemsListUL.length; i++){
        itemsListUL[i]
            .querySelector(".itemComplete")
            .addEventListener("click", function(){

            var index = this.parentNode.parentNode.dataset.itemindex;
            itemComplete(index);
        });

        itemsListUL[i]
            .querySelector(".itemDelete")
            .addEventListener("click", function(){

            var index = this.parentNode.parentNode.dataset.itemindex;
            itemDelete(index);
        });
       }
    }catch(e){

    }
}


async function itemComplete(index){

    const itemsStorage = await chrome.storage.local.get("todo-items");
    var itemsArr = JSON.parse(itemsStorage["todo-items"] || "[]" );

    itemsArr[index].status = 1;

    await saveItems(itemsArr);

    document.querySelector('ul.todo-items li[data-itemindex="'+index+'"]').className='done';

}

async function itemDelete(index){

    const itemsStorage = await chrome.storage.local.get("todo-items");
    var itemsArr = JSON.parse(itemsStorage["todo-items"] || "[]" );

    itemsArr.splice(index, 1);

    await saveItems(itemsArr);

    document
        .querySelector('ul.todo-items li[data-itemindex="'+index+'"]')
        .remove();

}


async function saveItems(obj){

  var string = JSON.stringify(obj);
  await chrome.storage.local.set({"todo-items": string});

}

fetchItems();

let scrapeEmails = document.querySelector
('.button-92');


let list = document.getElementById('emailList');


chrome.runtime.onMessage.addListener((request,sender,sendResponse) => {

    let emails = request.emails;


    if(emails == null || emails.length == 0){

        let li = document.createElement('li');
        li.innerText = "No Emails Found";
        list.appendChild(li);
    }  else{

        emails.forEach((email) => {
            let li = document.createElement('li');
            li.innerText = email;
            list.appendChild(li);
        })
    }
})


scrapeEmails.addEventListener("click",async ()=>{
    
    let [tab] = await chrome.tabs.query({active: true, currentWindow:true});

    chrome.scripting.executeScript({
        target: {tabId: tab.id},
        func: scrapeEmailsFromPage,
    });
})


function scrapeEmailsFromPage(){
   const emailRegEx  = /[\w\.-]+@[\w\.-]+\.[\w]{2,3}/gim;

   let emails = document.body.innerHTML.match(emailRegEx);

   chrome.runtime.sendMessage({emails});
}