const Discord = require('discord.js');
const client = new Discord.Client();

const gapi = require('./gapi.js');
var auth = require('./auth.json');
const token = auth.token;

const column = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL', 'AM', 'AN', 'AO', 'AP', 'AQ', 'AR', 'AS', 'AT', 'AU', 'AV', 'AW', 'AX', 'AY', 'AZ',
    'BA', 'BB', 'BC', 'BD', 'BE', 'BF', 'BG', 'BH']
var objlist = { "1": "一王", "2": "二王", "3": "三王", "4": "四王", "5": "五王", "一": "一王", "二": "二王", "三": "三王", "四": "四王", "五": "五王" }


// google sheet id
const ssidlist = [
    '1B59MPDbQokXq3vkEG5oG2Ef8-JccN8eWsl9r6gTew6w',  //將本行更新為你們公會的表單ID 記得放在引號裡面
]

const chlist = {
    '562681435224539141': ssidlist[0],
    '562170871213719553': ssidlist[0],
    //在這兩個頻道中填表, 都會連結到上面的第一個表單
    //'新頻道ID': ssidlist[1],

}

//channel id : role id
// const grouptaglist = {
//     '486490020690001923': '492966022194659349', 
//     '562170871213719553': '492966022194659349', 
// }

var userlist = {}
var channelid = '' //channel to broadcast from direct message 


/************************************** */
// 避免呼叫指令時間太相近造成衝突, 此為一個排隊機制
var EventEmitter = require('events').EventEmitter;
class FunctionQueue extends EventEmitter {
    constructor(props) {
        super(props)
        this.list = []
    }

    push(fn) {
        this.list.push(fn)
        this.emit('push')
    }

    async run() {
        const results = await this.list[0]()
        this.list.shift()
        this.emit('pop', results)
    }
}

const queue = new FunctionQueue()

queue.on('push', () => {
    if (queue.list.length === 1) {
        queue.run()
    }
})
queue.on('pop', (results) => {
    // console.log('results', results)
    if (queue.list.length > 0) {
        queue.run()
    }
})

/***************************************/


client.on('ready', async () => {

    for (i in ssidlist) {
        var ul = await gapi.getUserList(ssidlist[i]);
        for (var j in ul) {
            userlist[ul[j][1]] = [ul[j][0], ssidlist[i]];
        }
    }
    console.log(userlist);

    console.log(client.user.username + " is ready.");
});


client.on('message', async message => {

    if (message.author.bot) return;

    if (message.content.substring(0, 1) === "!" || message.content.substring(0, 1) === "！") {

        const args = message.content.slice(1).trim().split(/ +/g);
        const command = args.shift().toLowerCase();


        if (message.author.id in userlist && message.channel.id in chlist) {

            if (command === 'fill' || command === '填表' || command === '傷害') {
                queue.push(async () => {
                    try {
                        memberid = message.author.id;
                        demage = parseInt(args[0]);
                        if (isNaN(demage) || demage > 10000000) {
                            message.reply('傷害數值錯誤或過高!');
                            return;
                        }
                        object = '';
                        ps = '';
                        if (args.length >= 2) {
                            for (var i = 1; i < args.length; i++) {
                                arg = args[i].substring(0, 1);
                                // console.log(arg)
                                if (arg === '尾' || arg === '殘') {
                                    ps = arg;
                                }
                                else if (arg === '1' || arg === '2' || arg === '3' || arg === '4' || arg === '5'
                                    || arg === '一' || arg === '二' || arg === '三' || arg === '四' || arg === '五') {
                                    object = arg;
                                }
                                else throw new Error('不正確的fill指令: ' + message.author.username + ':' + message.content)
                            }
                        }
                        await fillandreply(message, memberid, demage, object, ps);
                    }
                    //例外狀況
                    catch (err) {
                        console.log(err);
                        message.reply('請以 <!fill 傷害數值 目標(1/1王/一王) (尾/殘)> 的形式呼叫');
                    }
                })
                return;
            }
            else if (command === 'fillfor' || command === '代填' || command === '幫填') {
                queue.push(async () => {
                    try {
                        var memberid = args[0].replace(/[^0-9\.]+/g, '');
                        if (!(memberid in userlist)) {
                            throw new Error('錯誤的成員名稱!');
                        }
                        demage = parseInt(args[1]);
                        if (isNaN(demage)) {
                            message.reply('傷害數值錯誤!');
                            return;
                        }
                        object = '';
                        ps = '';
                        if (args.length >= 3) {
                            for (var i = 2; i < args.length; i++) {
                                arg = args[i].substring(0, 1);
                                // console.log(arg)
                                if (arg === '尾' || arg === '殘') {
                                    ps = arg;
                                }
                                else if (arg === '1' || arg === '2' || arg === '3' || arg === '4' || arg === '5'
                                    || arg === '一' || arg === '二' || arg === '三' || arg === '四' || arg === '五') {
                                    object = arg;
                                }
                                else throw new Error('不正確的fill指令: ' + message.author.username + ':' + message.content)
                            }
                        }
                        await fillandreply(message, memberid, demage, object, ps);
                    }
                    //例外狀況
                    catch (err) {
                        console.log(err);
                        message.reply('請以 <!fillfor @成員 傷害數值 目標 (尾/殘)> 的形式呼叫');
                    }
                })
                return;
            }

            else if (command === 'status') {
                queue.push(async () => {

                    //查自己的
                    if (args.length == 0) {
                        memberid = message.author.id;
                        statusandreply(message, memberid)
                    }
                    //查別人的
                    else if (args.length == 1) {
                        memberid = args[0].replace(/[^0-9\.]+/g, '');
                        if (!(memberid in userlist)) {
                            message.reply('錯誤的成員名稱');
                            return;
                        }
                        statusandreply(message, memberid)
                    }
                    else {
                        message.reply('請以<!status> 或 <!status @成員名稱> 的形式呼叫');
                    }
                })
                return;

            }
            else if (command === 'remind') {
                try {
                    var table = await gapi.getDemageTable(chlist[message.channel.id]);
                    leftknife = table[32][1];
                    lefttime = callefttime(5);//以五點為基準
                    message.channel.send(String.format('今天還有{0}刀未出，距離5點還有{1}', leftknife, lefttime))
                }
                catch (err) {
                    console.log(err.message + ' : ' + message.author.username + ':' + message.content)
                    console.log(err)
                    message.reply('錯誤訊息: ' + err.message);
                }
                return;
            }
            else if (command === '查刀') {
                try {
                    var table = await gapi.getDemageTable(chlist[message.channel.id]);
                    // console.log(table)
                    var msg = '剩餘刀數　成員名稱\n'
                    var count = 0
                    var compenstate_count = 0
                    for (var row = 2; row < 32; row++) {
                        leftknife = table[row][1]
                        if (table[row][18] == 'v') compenstate_count += 1
                        hascompensate = table[row][18] == 'v' ? '(有殘)' : '             '
                        if (leftknife == 0 && table[row][18] != 'v') continue;
                        var group = (table[row][19] == '' || typeof table[row][19] === 'undefined') ? '' : String.format(' ({0})', table[row][19])
                        msg += String.format('{0}刀 {1}  {2}{3} ', leftknife, hascompensate, table[row][0], group)
                        count += leftknife
                        if (leftknife < 3) {
                            msg += ' 已出: '
                            for (var i = 4; i <= 14; i += 5) {
                                obj = table[row][i]
                                if (!obj.isNaN)
                                    msg += obj + ' '
                            }
                        }
                        msg += '\n'
                    }
                    if (count == 0 && compenstate_count == 0) msg = '今日已全數出完'
                    else msg += String.format('總計 {0} 刀', count)

                    message.channel.send(msg);
                }
                catch (err) {
                    console.log(err.message + ' : ' + message.author.username + ':' + message.content)
                    console.log(err)
                    message.reply('錯誤訊息: ' + err.message);
                }
                return;
            }
            else if (command === 'url' || command === '表單' || command === '表格') {
                ssid = chlist[message.channel.id]//chlist[message.channel.id]
                message.channel.send('https://docs.google.com/spreadsheets/d/' + ssid);

                return;
            }

            else if (command === 'crashlist' || command === '閃退') {
                try {
                    var table = await gapi.getDemageTable(chlist[message.channel.id]);
                    var msg = '今日閃退已用成員:(若要登記閃退請使用<!登記閃退>)\n'
                    var count = 0;
                    for (var i = 2; i < 32; i++) {
                        if (table[i][2]) {
                            msg += table[i][0] + '\n';
                            count++;
                        }
                    }
                    if (count > 0) msg += String.format('總數 {0} 人', count);
                    else msg = '今日尚未有閃退紀錄'
                    message.channel.send(msg);
                }
                catch (err) {
                    console.log(err.message + ' : ' + message.author.username + ':' + message.content)
                    console.log(err)
                    message.reply('錯誤訊息: ' + err.message);
                }
                return;
            }
            else if (command === '登記閃退' || command === '閃退登記') {
                try {
                    var table = await gapi.getDemageTable(chlist[message.channel.id]);
                    for (var i = 2; i < 32; i++) {
                        if (table[i][0] == userlist[message.author.id][0]) {
                            result = await gapi.fillin(String.format('C{0}', i + 1), [[true]], chlist[message.channel.id], '');
                            message.reply('已登記閃退');
                            return;
                        }
                    }
                }
                catch (err) {
                    console.log(err.message + ' : ' + message.author.username + ':' + message.content)
                    console.log(err)
                    message.reply('錯誤訊息: ' + err.message);
                }
                return;
            }

            else if (command === '分組' || command === '分組說明' || command === 'gp') {
                try {
                    var table = await gapi.getGroup(chlist[message.channel.id]);
                    var msg = '今日分組說明:\n'
                    for (var i = 1; i < table.length; i++) {
                        if (table[i][0] != '') {
                            if (typeof table[i][4] != "undefined") {
                                msg += String.format('- {0}   目標 {1}   還有 **{3}**/{4} 個名額   說明: {2}\n', table[i][0], table[i][2], table[i][4], table[i][1] - table[i][3], table[i][1])
                            }
                            else {
                                msg += String.format('- {0}   目標 {1}   還有 **{3}**/{4} 個名額\n', table[i][0], table[i][2], table[i][4], table[i][1] - table[i][3], table[i][1])
                            }
                        }
                        else break;
                    }
                    msg += '可使用 <!選組 組別名稱> 或 <!報名 組別名稱> 來報名組別 ex: !報名 ' + table[1][0]
                    message.channel.send(msg);
                }
                catch (err) {
                    console.log(err.message + ' : ' + message.author.username + ':' + message.content)
                    console.log(err)
                    message.reply('錯誤訊息: ' + err.message);
                }
                return;
            }

            else if (command === '報名' || command === '選組') {
                try {
                    var newGroup
                    var memberid
                    if (args.length == 1) {
                        newGroup = args[0];
                        memberid = message.author.id;
                    }
                    else if (args.length == 2) {
                        memberid = args[0].replace(/[^0-9\.]+/g, '');
                        if (!(memberid in userlist)) {
                            throw new Error('錯誤的成員名稱!');
                        }
                        newGroup = args[1];
                    }
                    else {
                        message.reply('指令輸入錯誤! 請使用 <!選組 組別名稱> 進行報名 ex: !選組 A');
                        return;
                    }

                    var table = await gapi.getGroup(chlist[message.channel.id]);
                    var grouplist = {}
                    for (var i = 1; i < table.length; i++) {
                        if (table[i][0] != '') {
                            grouplist[table[i][0]] = table[i][1] - table[i][3]
                        }
                        else break;
                    }

                    if (!(newGroup in grouplist)) {
                        message.reply('組別輸入錯誤! 請使用 <!分組> 取得今日分組說明')
                        return;
                    }
                    if (grouplist[newGroup] <= 0) {
                        message.reply('組別人數已滿! 請使用 <!查組> 取得詳細分組名單')
                        return;
                    }

                    var Dtable = await gapi.getDemageTable(chlist[message.channel.id]);
                    var row = 0;
                    for (var i = 0; i < Dtable.length; i++) {
                        if (Dtable[i][0] == userlist[memberid][0]) row = i
                    }
                    if (row == 0) {
                        throw new Error('查無此人')
                    }
                    var oriGroup = Dtable[row][19]
                    result = await gapi.fillin(column[19] + (row + 1), [[newGroup]], chlist[message.channel.id], '');

                    if (oriGroup == '' || typeof oriGroup === 'undefined') message.reply(String.format('{1} 已分到 {0}', newGroup, Dtable[row][0]))
                    else message.reply(String.format('{2} 已由 {1} 改為 {0}', newGroup, oriGroup, Dtable[row][0]))

                }
                catch (err) {
                    console.log(err.message + ' : ' + message.author.username + ':' + message.content)
                    console.log(err)
                    message.reply('錯誤訊息: ' + err.message);
                }
                return;
            }

            else if (command === '查組' || command === '分組名單') {
                try {
                    var table = await gapi.getGroup(chlist[message.channel.id]);
                    var grouplist = {}
                    for (var i = 1; i < table.length; i++) {
                        if (table[i][0] != '') {
                            grouplist[table[i][0]] = [String.format('{0}/{1}', table[i][3], table[i][1]), '']
                        }
                        else break;
                    }

                    var Dtable = await gapi.getDemageTable(chlist[message.channel.id]);
                    var unselected = ''
                    for (var i = 2; i < Dtable.length - 1; i++) {
                        if (Dtable[i][19] == '' || typeof Dtable[i][19] === 'undefined') {
                            unselected += Dtable[i][0] + ', '
                        }
                        else {
                            // console.log(Dtable[i][19])
                            if (Dtable[i][19] in grouplist)
                                grouplist[Dtable[i][19]][1] += Dtable[i][0] + ', '
                            else
                                unselected += Dtable[i][0] + ', '
                        }
                    }

                    msg = '各組別 已報人數/總人數 與 報名人員如下:\n'
                    for (var i = 1; i < table.length; i++) {
                        msg += String.format('- {0} ({1}) : {2}\n\n', table[i][0], grouplist[table[i][0]][0], grouplist[table[i][0]][1].substring(0, grouplist[table[i][0]][1].length - 2)) //substring去逗號
                    }
                    msg += '未選組 : ' + unselected.substring(0, unselected.length - 2)

                    message.channel.send(msg)
                }
                catch (err) {
                    console.log(err.message + ' : ' + message.author.username + ':' + message.content)
                    console.log(err)
                    message.reply('錯誤訊息: ' + err.message);
                }
                return;
            }


            /************* */
            else if (command === '集刀說明') {

                var embed = {
                    "title": "集刀功能說明",
                    "description": "本功能與傷害紀錄表中的集刀分頁連動，若有換人需求可至排刀表手動修改\n本功能也可用於出刀報數，方便統計報名者，並隨時查看名單", /******************* */
                    "color": 1500903,
                    "fields": [
                        {
                            "name": "<!集刀 五王>",
                            "value": "清空集刀表，開始新的集刀"
                        },
                        {
                            "name": "<!刀表> 或 <!集刀表>",
                            "value": "查看目前集刀報名人員清單、進場狀態，和回報傷害"
                        },
                        {
                            "name": "<!回復> 或 <!recover>",
                            "value": "若誤清集刀表，可用此指令回復上一個集刀名單"
                        },
                        {
                            "name": "<!報數>",
                            "value": "會將呼叫者排進集刀列表中，順序以呼叫指令的先後為主"
                        },
                        {
                            "name": "<!進場>",
                            "value": "登記進場"
                        },
                        {
                            "name": "<!回報 [回報訊息]>",
                            "value": "例如\"7秒139 女帝未開\"，再次呼叫此指令可以更新訊息"
                        },
                    ]
                };
                message.channel.send({ embed });
                return;
            }

            else if (command === '集刀表' || command === '刀表') {
                var tables = await gapi.getCollectingtable(chlist[message.channel.id]);
                var ctable = tables[0];
                var dtable = tables[1]; //為了拿剩餘刀數 才讀傷害表
                var remsg = `開始時間 ${ctable[1][0]}  目標 ${ctable[3][0]}\n`
                for (i = 2; i < ctable[0].length; i++) {
                    remsg += String.format('{0}  {1}', ctable[0][i], ctable[1][i])
                    remsg += ' ' + await getleftknife(dtable, ctable[1][i])
                    remsg += getgroup(dtable, ctable[1][i]) != "" ? ' ' + getgroup(dtable, ctable[1][i]) : ''
                    if (ctable[2][i] === 'v') remsg += ' (閃過)'
                    if (ctable[3][i] === 'v') remsg += ' (已進)'
                    if (ctable[4][i]) remsg += ' 回報: ' + ctable[4][i]
                    remsg += '\n'
                }
                message.channel.send(remsg);
                return;
            }

            else if (command === '集刀' || command === '集刀開始' || command === 'start') {
                queue.push(async () => {

                    try {
                        if (args.length != 1) {
                            message.channel.send('請輸入要集刀的王 ex: !集刀 5王');
                            return;
                        }

                        //backup
                        var oldctable = await gapi.getCollectingtablebyRow(chlist[message.channel.id]);
                        var bk_table = [...Array(30)].map(x => Array(5).fill(''))
                        for (i = 0; i < oldctable.length; i++) {
                            for (j = 0; j < oldctable[i].length; j++)
                                bk_table[i][j] = oldctable[i][j]
                        }
                        backupresult = await gapi.fillin('A33:E62', bk_table, chlist[message.channel.id], '集刀');

                        //get args
                        var target = args[0];
                        if (target.substr(target.length - 1) != '王') target += '王'
                        var dt = new Date();
                        var starttime = `${dt.getHours()}:${dt.getMinutes()}`;
                        //get which group to tag
                        // let tag = grouptaglist[message.channel.id]

                        //write
                        let firstrow = ['時間', starttime, '目標', target]
                        let secondrow = ['順序', '成員名稱', '今日已閃', '進場', '回報訊息']
                        let matrix = [...Array(29)].map(x => Array(5).fill(''))
                        matrix = [firstrow, secondrow, ...matrix]
                        let result = await gapi.fillin('A1:E31', matrix, chlist[message.channel.id], '集刀');
                        message.channel.send('集刀表已重置 請使用<!報數> 進行報數\n若誤清可使用 <!回復> 或 <!recover> 回復上一個刀表').then(d_msg => { d_msg.delete(5000) });
                        // message.channel.send(`<@&${tag}> ${target}`)

                    }
                    catch (err) {
                        console.log(err)
                        console.log(err.message + ' : ' + message.author.username + ':' + message.content)
                        message.reply('錯誤訊息: ' + err.message);
                    }
                })
                return;
            }
            else if (command === '集刀結束') {
                message.channel.send('現在不用先喊結束囉 直接 <!集刀> 就可以了!').then(d_msg => { d_msg.delete(5000) });
                return;
            }

            else if (command === '回復' || command === 'recover') {
                //recover
                queue.push(async () => {

                    try {
                        //get bk table
                        var oldctable = await gapi.getBKCollectingtable(chlist[message.channel.id]);
                        var bk_table = [...Array(31)].map(x => Array(5).fill(''))
                        for (i = 0; i < oldctable.length; i++) {
                            for (j = 0; j < oldctable[i].length; j++)
                                bk_table[i][j] = oldctable[i][j]
                        }
                        result = await gapi.fillin('A1:E31', bk_table, chlist[message.channel.id], '集刀');
                        message.channel.send('集刀表已回復')
                    }
                    catch (err) {
                        console.log(err.message + ' : ' + message.author.username + ':' + message.content)
                        console.log(err)
                        message.reply('錯誤訊息: ' + err.message);
                    }
                })
                return;
            }

            else if (command === '報數' || command === '報') {
                queue.push(async () => {
                    try {
                        var tables = await gapi.getCollectingtable(chlist[message.channel.id]);
                        memberName = userlist[message.author.id][0];
                        ctable = tables[0];
                        if (ctable[1].indexOf(memberName) != -1) {
                            message.reply('已在集刀表中').then(d_msg => { d_msg.delete(5000) });
                            return;
                        }
                        //取閃退狀態
                        dtable = tables[1];
                        row = ctable[0].length - 1; //插入位置
                        crashed = await getcrash(dtable, memberName);
                        content = [[row, memberName, crashed ? 'v' : '']]
                        //TODO: 取剩餘刀數
                        result = await gapi.fillin(`A${row + 2}:C${row + 2}`, content, chlist[message.channel.id], '集刀');
                        message.reply('報數成功,你的編號是' + row).then(d_msg => { d_msg.delete(5000) });
                    }
                    catch (err) {
                        console.log(err.message + ' : ' + message.author.username + ':' + message.content)
                        console.log(err)
                        message.reply('錯誤訊息: ' + err.message);
                    }
                    return 0;
                })
                return;
            }
            else if (command === '進場' || command === '進') {
                queue.push(async () => {
                    try {
                        var tables = await gapi.getCollectingtable(chlist[message.channel.id]);
                        memberName = userlist[message.author.id][0];
                        ctable = tables[0];
                        row = ctable[1].indexOf(memberName) //呼叫者所在row
                        if (row < 0) {
                            message.reply('不在集刀表中。').then(d_msg => { d_msg.delete(5000) });
                            return;
                        }
                        var doublecall = false; //檢查是否重複呼叫
                        if (ctable[3][row] === 'v') {
                            doublecall = true;
                        }
                        var mancount = ctable[0].length - 2; //因會算到tittle
                        var entercount = 0; //已進場人數
                        ctable[3].forEach(function (x) { if (x === 'v') entercount += 1 });
                        if (!doublecall) entercount += 1; //如果未重複呼叫 進場人數要加上自己
                        count = mancount - entercount; //未進人數
                        content = [['v']]
                        result = await gapi.fillin(String.format('D{0}', row + 1), content, chlist[message.channel.id], '集刀');
                        var msg = '';
                        if (count > 0) msg += String.format('{0} 已進場\n還有 {1} 個成員還沒進場', memberName, count);
                        else msg += String.format('{0} 已進場\n所有成員已全數進場', memberName);
                        message.reply(msg).then(d_msg => { d_msg.delete(5000) });
                    }
                    catch (err) {
                        console.log(err.message + ' : ' + message.author.username + ':' + message.content);
                        console.log(err);
                        message.reply('錯誤訊息: ' + err.message);
                    }
                })
                return;
            }
            else if (command === '回報') {
                queue.push(async () => {
                    var str = ''; //組合回報訊息(args)
                    if (args.length >= 1) {
                        for (var i = 0; i < args.length; i++) {
                            str += args[i] + ' ';
                        }
                    }
                    else {
                        message.reply('請回報傷害').then(d_msg => { d_msg.delete(5000) });
                        return;
                    }
                    try {
                        var tables = await gapi.getCollectingtable(chlist[message.channel.id]);
                        memberName = userlist[message.author.id][0];
                        ctable = tables[0];
                        row = ctable[1].indexOf(memberName)
                        if (row < 0) {
                            message.reply('不在集刀表中。').then(d_msg => { d_msg.delete(5000) });
                            return;
                        }
                        var doublecall = false; //檢查是否重複呼叫
                        if (typeof (ctable[4][row]) != 'undefined') {
                            // console.log(typeof(ctable[4][row]))
                            doublecall = true;
                        }
                        var mancount = ctable[0].length - 2; //集刀表人員總數 因會算到tittle 所以-1
                        var reportcount = -1; //已回報人數
                        ctable[4].forEach(function (x) { if (x != '') reportcount += 1 });
                        // console.log(reportcount)
                        count = mancount - reportcount; //未回報人數

                        content = [[str]];
                        result = await gapi.fillin(String.format('E{0}', row + 1), content, chlist[message.channel.id], '集刀');
                        if (!doublecall) count -= 1; //如果第一次呼叫 未回報人數要扣掉自己這次回報

                        var msg = '';
                        if (count > 0) msg += String.format('{0} 已回報(再次呼叫此指令可覆蓋前一次回報訊息)\n還有 {1} 個成員還沒回報', memberName, count);
                        else msg += String.format('{0} 已回報(再次呼叫此指令可覆蓋前一次回報訊息)\n所有成員都已回報', memberName);
                        message.reply(msg).then(d_msg => { d_msg.delete(5000) });
                    }
                    catch (err) {
                        console.log(err.message + ' : ' + message.author.username + ':' + message.content)
                        console.log(err)
                        message.reply('錯誤訊息: ' + err.message);
                    }
                })
                return;


            }
        }

        /*****大眾功能*****/

        if (command === 'help' || command === '說明') {
            var embed = {
                "title": "書記使用說明書",
                "description": "",
                "color": 1500903,
                "timestamp": "2019-12-21T02:02:33.417Z",
                "image": {
                    "url": "https://imgur.com/dEBTCu6.jpg" //takagi

                },
                "author": {
                    "name": "綿木同學",
                    "icon_url": "https://imgur.com/fozYyuU.jpg"
                },
                "fields": [
                    {
                        "name": "<!fill 傷害 目標> 或 <!填表 傷害 目標>",
                        "value": "為呼叫者填傷害，目標用12345或一二三四五都可以。ex: !fill 2000000 3"
                    },
                    {
                        "name": "<!fill 傷害 目標 尾刀/殘刀> 或 <!填表 傷害 目標 尾刀/殘刀>",
                        "value": "若是尾刀或補償刀(殘刀)，只要在最後加註尾或殘即可。ex: !fill 2000000 五 殘；在尾刀有勾的情況下，下次填表都會自動當成殘刀"
                    },
                    {
                        "name": "<!fillfor @成員 傷害 目標 (尾/殘)> 或 <!代填 @成員 傷害 目標 (尾/殘)>",
                        "value": "可幫tag的團員填傷害 ex: !fillfor @蒼蘭 7777777"
                    },
                    {
                        "name": "<!status> 或 <!status @成員>",
                        "value": "查看呼叫者或某成員當日傷害紀錄"
                    },
                    {
                        "name": "<!remind>",
                        "value": "查看該頻道公會當日剩餘刀數"
                    },
                    {
                        "name": "<!查刀>",
                        "value": "查看該頻道公會每人所剩刀數和已輸出的目標"
                    },
                    {
                        "name": "<!分組> 或 <!分組說明>",
                        "value": "查看該頻道公會當日分組說明"
                    },
                    {
                        "name": "<!選組 組名> 或 <!報名 組名>",
                        "value": "為呼叫者登記當日組別 ex: !選組 A"
                    },
                    {
                        "name": "<!選組 @成員 組名> 或 <!報名 @成員 組名>",
                        "value": "為tag的成員登記當日組別 ex: !選組 @蒼蘭 A"
                    },
                    {
                        "name": "<!查組>",
                        "value": "查看該頻道公會每組報名人數及名單"
                    },
                    {
                        "name": "<!閃退> 或 <!crashlist>",
                        "value": "查看該頻道公會當日閃退人員清單"
                    },
                    {
                        "name": "<!登記閃退> 或 <!閃退登記>",
                        "value": "登記呼叫者當日閃退"
                    },
                    {
                        "name": "<!url> 或<!表單>",
                        "value": "查看該頻道公會的傷害紀錄表"
                    },
                    {
                        "name": "<!集刀說明>",
                        "value": "取得詳細集刀指令"
                    }
                ]
            };
            message.channel.send({ embed });
        }
        else if (command === 'reload') {
            try {
                userlist = {};
                for (i in ssidlist) {
                    var ul = await gapi.getUserList(ssidlist[i]);
                    for (var j in ul) {
                        userlist[ul[j][1]] = [ul[j][0], ssidlist[i]];
                    }
                }
                console.log(userlist);
                message.channel.send('已重新讀取成員名單')
            }
            catch (err) {
                console.log(err.message + ' : ' + message.author.username + ':' + message.content)
                console.log(err)
                message.reply('錯誤訊息: ' + err.message);
            }
            return;
        }
        else {
            otherreply(message, command, args);
        }




    }

});


client.login(token);

/***************************************/


async function statusandreply(message, memberid) {
    try {
        memberName = userlist[memberid][0];
        var table = await gapi.getDemageTable(chlist[message.channel.id]); //取得當天排刀表 userlist[memberid][1]
        var status = await getstatus(table, memberName);
        // console.log(status) //obj

        var repmsg = {
            "embed":
            {
                "title": memberName + " 今日狀態",
                "color": 5301186,
                "fields": status
            }
        };
        // console.log(repmsg) //obj

        message.reply(repmsg);
    }
    catch (err) {
        console.log(err.message + ' : ' + message.author.username + ':' + message.content)
        console.log(err)
        message.reply('錯誤訊息: ' + err.message);
    }
}


async function fillandreply(message, memberid, demage, object, ps) {
    try {
        if (object == '') {
            message.reply('請填寫輸出目標。ex: !fill 1234567 1');
            return;
        }
        memberName = userlist[memberid][0];
        var table = await gapi.getDemageTable(chlist[message.channel.id]);
        var former_status = await getstatus(table, memberName);

        await fillindemage(message, table, memberid, demage, object, ps);

        var table2 = await gapi.getDemageTable(chlist[message.channel.id]);
        var latter_status = await getstatus(table2, memberName);


        var repmsg = {
            "embed":
            {
                "title": memberName + " 今日狀態已更新為:",
                "color": 5301186,
                "fields": latter_status
            }
        };

        message.reply(repmsg);
    }
    catch (err) {
        console.log(err.message + ' : ' + message.author.username + ':' + message.content);
        if (err.message == 'no fillable cell') {
            var embed = {
                "title": memberName + " 今日狀態",
                "color": 5301186,
                "fields": former_status
            };
            message.reply("找不到可填的欄位!", { embed });
        }
        else {
            message.reply('錯誤訊息: ' + err.message);
        }
    }
}

async function fillindemage(message, table, memberid, demage, object, ps) {
    return new Promise(async function (resolve, reject) {
        try {
            memberName = userlist[memberid][0];
            row = 0;
            for (var i = 0; i < table.length; i++) {
                if (table[i][0] == memberName) row = i
            }

            //先找有勾尾且還沒有殘刀傷害的
            for (var j = 5; j < table[1].length; j += 5) {
                if (table[row][j] == true) {
                    if (table[row][j + 1] == '' || typeof table[row][j + 1] === 'undefined') { //尾刀打勾且殘刀傷害空白
                        result = await gapi.fillin(column[j + 1] + (row + 1), [[demage]], chlist[message.channel.id], '');
                        if (object != '') {
                            result = await gapi.fillin(column[j + 2] + (row + 1), [[objlist[object]]], chlist[message.channel.id], '');
                        }
                        resolve(result);
                        return;
                    }
                }
            }

            // console.log(table)
            //再來找沒勾尾 但有ps殘的 -> 找殘刀傷害空白 且下一隊傷害空白
            if (ps === '殘') {
                for (var j = 6; j < table[1].length; j += 5) {
                    if (table[row][j] == '' || isNaN(table[row][j])) { //殘刀傷害空白
                        if (j + 2 >= table[row].length) {
                            result = await gapi.fillin(column[j] + (row + 1), [[demage]], chlist[message.channel.id], '');
                            if (object != '') {
                                result = await gapi.fillin(column[j + 1] + (row + 1), [[objlist[object]]], chlist[message.channel.id], '');
                            }
                            resolve(result);
                            return;
                        }
                        else {
                            if (table[row][j + 2] == '') {//下一隊傷害空白
                                result = await gapi.fillin(column[j] + (row + 1), [[demage]], chlist[message.channel.id], '');
                                if (object != '') {
                                    result = await gapi.fillin(column[j + 1] + (row + 1), [[objlist[object]]], chlist[message.channel.id], '');
                                }
                                resolve(result);
                                return;
                            }
                        }

                    }
                }
                throw new Error('無尾刀紀錄或是殘刀傷害已填')////

            }
            else {
                for (var j = 3; j < table[1].length; j += 5) {
                    if (table[row][j] == '') { //如果傷害空白
                        result = await gapi.fillin(column[j] + (row + 1), [[demage]], chlist[message.channel.id], '');
                        if (ps === '尾') {
                            result = await gapi.fillin(column[j + 2] + (row + 1), [[true]], chlist[message.channel.id], '');
                        }
                        if (object != '') {
                            result = await gapi.fillin(column[j + 1] + (row + 1), [[objlist[object]]], chlist[message.channel.id], '');
                        }
                        resolve(result);
                        return;
                    }
                }
                throw new Error('no fillable cell');
            }
        }
        catch (err) {
            // console.log(err);
            reject(err);
        }
    })
}

function getstatus(table, memberName) {
    return new Promise(function (resolve, reject) {
        row = 0;
        for (var j = 0; j < table.length; j++) {
            if (table[j][0] == memberName) row = j
        }
        sta = [
            {
                "name": "閃退",
                "value": table[row][2] ? '已用' : '未用'
            }
        ]

        //加入本刀傷害
        for (var j = 3; j <= 13; j += 5) {
            if (table[row][j] > 0) {
                sta.push({
                    "name": table[0][j],
                    "value": table[row][j] + ' ' + table[row][j + 1] + ' ' + (table[row][j + 2] ? '尾' : ''),
                    "inline": true
                })
            }
        }
        // console.log(table[row].length)
        //加殘刀傷害
        for (var j = 6; j <= 16; j += 5) {
            if (table[row][j] > 0) {
                sta.push({
                    "name": table[0][j - 3] + " 殘刀",
                    "value": table[row][j] + ' ' + table[row][j + 1],
                    "inline": true
                })
            }
        }

        resolve(sta);
    })
}

function getcrash(table, memberName) {
    return new Promise(function (resolve, reject) {
        var crash = false; //boss team demage
        for (var j = 0; j < table.length; j++) {
            if (table[j][0] == memberName) {
                crash = table[j][2]
            }
        }
        resolve(crash);
    })
}

function getleftknife(table, memberName) {
    var leftknife = "";
    for (var j = 0; j < table.length; j++) {
        if (table[j][0] == memberName) {
            if (table[j][18] == "v")
                leftknife += "殘+"
            leftknife += table[j][1] + "刀"

        }
    }
    // console.log(leftknife)
    return (leftknife);
}

function getgroup(table, memberName) {
    var group = "";
    for (var j = 0; j < table.length; j++) {
        if (table[j][0] == memberName) {
            if (typeof table[j][19] != 'undefined') {
                // console.log(table[j][19])
                group += table[j][19] + "組"
            }
        }
    }
    return group;
}

String.format = function () {
    var s = arguments[0];
    for (var i = 0; i < arguments.length - 1; i++) {
        var reg = new RegExp("\\{" + i + "\\}", "gm");
        s = s.replace(reg, arguments[i + 1]);
    }

    return s;
}

function callefttime(baselinehour) {
    var now = new Date();

    year = now.getFullYear();
    month = now.getMonth();
    date = now.getDate();
    hour = now.getHours();
    if (hour > 5) date = date + 1;
    var deadline = new Date(year, month, date, baselinehour)
    var substract = new Date(deadline - now)

    return (Math.floor(substract.getTime() / 3600000) + "小時" + substract.getUTCMinutes() + "分" + substract.getUTCSeconds() + "秒");
}


function otherreply(message, command, args) {

    if (command === 'dance') {
        return

    }

    else {
        return

    }
}

function replyimagefrom(message, command, path) {
    var fs = require('fs');
    var files = fs.readdirSync(path);
    files = files.sort(function () { return Math.random() > 0.5 ? -1 : 1; });
    var n = 0;
    var found = false;
    for (i = 0; i < files.length; i++) {
        if (files[i].toLowerCase().indexOf(command) != -1) {
            n = i;
            found = true;
            break;
        }
    }
    if (!found)
        n = Math.floor(Math.random() * files.length);
    message.channel.send({
        files: [
            path + files[n],
        ]
    });
}