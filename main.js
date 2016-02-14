var data, ticker = {};

function readFile(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function () {
        if(rawFile.readyState === 4) {
            if((rawFile.status === 200 || rawFile.status == 0) && typeof callback == 'function') {
                var allText = rawFile.responseText;
                callback(allText);
            }
        }
    }
    rawFile.send(null);
}

readFile('csv/stocks.csv', function(csv) {
    data = Papa.parse(csv, {
        header: true
    });
    console.log(data)
    for(var i = 0; i < data.data.length; i++) {
        ticker[data.data[i].Ticker] = data.data[i]
    }
})


var stockCallback;
function stockQuery(symbol, callback){
    stockCallback = callback
    var url = "http://query.yahooapis.com/v1/public/yql"
    var urldata = encodeURIComponent("select * from yahoo.finance.quotes where symbol in ('" + symbol + "')")
    var requrl = url + '?q=' + urldata + '&format=json&diagnostics=true&env=http://datatables.org/alltables.env'
    /*
    var req = new XMLHttpRequest();
    req.open("GET", requrl, false);
    req.onreadystatechange = function () {
        if(req.readyState === 4) {
            if((req.status === 200 || req.status == 0) && typeof callback == 'function') {
                var allText = req.responseText;
                callback(allText);
            }
        }
    }
    req.send(null);*/
    var script = document.createElement('script');
    script.type = 'text/javascript'
    script.src = requrl+'&callback=stockCallback'

    document.body.appendChild(script);
}

function tick(word) {
    var track = []
    var arr = [];
    for(var i = 0; i < word.length; i++) {
        for(var i2 = i+1; i2 < word.length+1; i2++){
            var sub = word.substr(i, i2 - i)
            //console.log(sub, i, i2)
            if(ticker[sub] != undefined) {
                if(i == 0){
                    arr.push([[sub], sub.length, 1])
                }else{
                    for(var i3 = 0; i3 < arr.length; i3++){
                        if(arr[i3][1] == i){
                            var nd = arr[i3][0].slice(0)
                            nd.push(sub)
                            arr.push([nd, arr[i3][1] + sub.length, arr[i3][2] + 1])
                        }
                    }
                }
            }
        }
    }
    console.log(arr)
    var s = word.length+1;
    var out;
    for(var i = 0; i < arr.length; i++){
        if(arr[i][1] == word.length && arr[i][2] < s){
            out = arr[i][0]
            s = arr[i][2]
        }
    }
    return out
}

function parse(e) {
    var text = document.querySelector('#input').value
    text = text.replace(/[^a-zA-Z ]/g, "")
    text = text.replace(/ +/g, " ")
    text = text.toUpperCase()
    text = text.split(' ')
    tickertext = text.map(tick)
    var output = document.querySelector('#output')
    output.innerHTML = ''
    for(var i = 0; i < tickertext.length; i++){
        if(tickertext[i] == undefined){
            var und = document.createElement('span')
            und.textContent = text[i]
            und.classList.add('undefined')
            output.appendChild(und)
        }else{
            for(var i2 = 0; i2 < tickertext[i].length; i2++){
                var el = document.createElement('span')
                el.classList.add('ticker')
                el.textContent = tickertext[i][i2]
                el.setAttribute('data-name', ticker[tickertext[i][i2]].Name)
                output.appendChild(el)
            }
        }
        var space = document.createElement('span')
        space.classList.add('space')
        output.appendChild(space)
    }
}
parse()
document.querySelector('#input').addEventListener('keydown', function(e){
    console.log('hi')
    setTimeout(parse.bind(null, e), 0)
})