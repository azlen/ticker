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
    for(var i = 0; i < data.data.length; i++) {
        ticker[data.data[i].Ticker] = data.data[i]
    }
})


var stockResponses = {}

function stockQuery(symbol, callback){
    var script;
    var rand = '_'+Math.random()*100000000000000000
    window[rand] = function(stockData){
        stockResponses[symbol] = stockData
        callback(stockData)
        document.body.removeChild(script)
    }
    if(stockResponses[symbol] != undefined){
        callback(stockResponses[symbol])
    }else{
        var url = "http://query.yahooapis.com/v1/public/yql"
        var urldata = encodeURIComponent("select * from yahoo.finance.quotes where symbol in ('" + symbol + "')")
        var requrl = url + '?q=' + urldata + '&format=json&diagnostics=true&env=http://datatables.org/alltables.env'

        script = document.createElement('script');
        script.type = 'text/javascript'
        script.src = requrl+'&callback='+rand

        document.body.appendChild(script);
    }
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
    //console.log(arr)
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

function createTickerElement(symbol){
    var el = document.createElement('span')
    el.classList.add('ticker')
    el.textContent = symbol
    el.setAttribute('data-name', ticker[symbol].Name)

    stockQuery(symbol, function(stockData){
        console.log(el)
        var change = Number(stockData.query.results.quote.ChangeinPercent.substr(0,5))
        if(change > 0){
            el.classList.add('positive')
        }else if(change < 0){
            el.classList.add('negative')
        }
    })

    return el
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
            var word = document.createElement('span')
            word.classList.add('word')
            for(var i2 = 0; i2 < tickertext[i].length; i2++){
                var symbol = tickertext[i][i2]
                var hh = createTickerElement(symbol)

                word.appendChild(hh)
            }
            output.appendChild(word)
        }
        var space = document.createElement('span')
        space.classList.add('space')
        output.appendChild(space)
    }
}
parse()
document.querySelector('#input').addEventListener('keydown', function(e){
    setTimeout(parse.bind(null, e), 0)
})