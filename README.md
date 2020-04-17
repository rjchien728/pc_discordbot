## 說明
遵照以下說明可以讓你在自己的電腦上架好這隻填表機器人，你也可以在各種雲端服務上(例如gcp,azure) 租一台虛擬機讓這隻bot24小時運作


## 安裝

1. 下載並安裝[node.js](https://nodejs.org/en/), 並確定有加到環境變數裡面
2. 下載本專案 並解壓縮 (或是用git直接clone)
3. 利用terminal進到專案資料夾中
4. > npm install
5. > npm install forever -g
6. 如果看不懂這一段, 可以google一下terminal, 學一下基本操作


## Discord設定
### - 新增Discord Bot
1. 到 https://discordapp.com/developers/applications 登入你的discord帳號後 新增Application
2. 建立好Application之後 到Bot 選擇Add Bot
3. 在這頁可以設定Bot名稱和大頭貼

### - 取得discord bot token
4. 在Bot這頁 選擇Copy 複製Token
5. 到 auth.json 裡面將Token換掉
```json
{
    "token": "將token貼在這裡"
}
```

### - 將bot加到discord伺服器裡面
6. 到General Information 複製Client id
7. https://discordapp.com/oauth2/authorize?&client_id=CLIENTID&scope=bot&permissions=8 將本網址中的CLIENTID取代成剛剛複製的ID
8. 進入上面這個網址
9. 登入後選擇要加入這隻Bot的Server(你必須是Server擁有者)

這段如果看不懂可以參考: https://www.digitaltrends.com/gaming/how-to-make-a-discord-bot/

## Google Sheets設定

### - 取得google sheets api token
1. https://developers.google.com/sheets/api/quickstart/nodejs#step_1_turn_on_the 按Enable the Google Sheets API 啟用google sheets api
2. 按 DOWNLOAD CLIENT CONFIGURATION
3. 將下載下來的 credentials.json 複製到資料夾裡 接下來在terminal中執行
4. > node index.js
5. 接下來terminal會顯示一串網址 點開這段網址 授權之後將畫面中的Code貼回Terminal 按Enter 應該會生成好 token.json
6. 這個token半年之後會過期, 到時候只要再執行一次index.js就好

詳細請參考官方教學: https://developers.google.com/sheets/api/quickstart/nodejs


### - 連結google sheets
- 本機器人連結的google sheets有固定格式如下檔:
https://docs.google.com/spreadsheets/d/1B59MPDbQokXq3vkEG5oG2Ef8-JccN8eWsl9r6gTew6w/
- 按檔案 -> 建立副本 建立貴公會自己的傷害紀錄表
並將權限調整為任何人都可以編輯(或至少要你啟用google sheets api的帳號可以編輯)
- 建立完成後 網址的最後一段即為表單的ID 以範本為例 就是1B59MPDbQokXq3vkEG5oG2Ef8-JccN8eWsl9r6gTew6w
- 複製表單ID 貼到bot.js 第16行的ssidlist裡面
```js
// google sheet id
const ssidlist = [
    '貼在這裡',  //將本行更新為你們公會的表單ID 記得放在引號裡面
]
```

### - 設定成員名單
- 為了取得成員的discord id(一串數字)要先開啟discord的開發者模式
    - 進入discord設定 -> 外觀 -> 進階裡面有開發者模式 把它打開
- 回到你的公會server, 對每一個成員按右鍵 -> 複製ID
    - 回到剛剛建立好副本的google sheets, 進到"成員ID對照表"那頁
    - 在第一欄輸入該成員的遊戲名稱(可以辨識就好), 在第二欄discord id輸入上面複製的ID
    - 第三欄可以輸入discord裡面的名稱方便辨識(有些人遊戲內名稱和discord名稱可能不一樣)(機器人只會讀前兩欄)
    - 重複上面步驟 直到30個人的ID都完成

### - 建立每日傷害頁面
- 因為bot會根據日期和時間選擇要在google sheets中填的分頁
- 請根據每月公會戰開始的日期複製"基本表格"那頁, 並將名稱改為月/日, 例如4/23
- 也可以複製一頁當天的日期在公會戰開始之前先測試bot功能
- p.s. 在清晨5點之前 bot會填在昨日 例如現在是4/25 01:00am 呼叫填表的時候bot會填在4/24那頁

## 執行須知

### - 最後的設定 快完成了!
1. 決定discord可以呼叫bot的文字頻道
2. 對頻道點右鍵 -> 複製ID
3. 到bot.js的第19行, 將複製好的ID貼到chlist裡面
```js
const chlist = {
    '貼在這裡': ssidlist[0], //在這個頻道中呼叫指令, 都會連結到ssidlist的第一個表單
}
```
4. 如果在同一個Server中有兩個公會, 可以這樣設定:
```js
const ssidlist = [
    '公會1的表單id',  
    '公會2的表單id',  
]

const chlist = {
    '公會1的頻道1id': ssidlist[0],
    '公會1的頻道2id': ssidlist[0],
    '公會2的頻道1id': ssidlist[1],
    '公會2的頻道2id': ssidlist[1],
}
```

### - 調整時區
- 因為bot會根據系統時間來決定填入的表格
- 如果使用雲端虛擬機的服務 記得調整好時間
- 以GCP的linux為例
- > cd ~
- > sudo cp /usr/share/zoneinfo/Asia/Taipei /etc/localtime  

- 不確定系統時間為何的可以使用`date`來確認


### - 開始執行Bot

> node bot.js
- 直接用node執行的話可以直接在終端機看到一些錯誤訊息
- 按crtl + c 停止
- 確定ok之後建議用forever來跑 所以執行下面這段

> forever start -w bot.js 
- 使用forever來執行bot可以防止因網路連線不穩而使bot當機的情況發生
- bot在執行開始時會讀取成員名單, 如果事後有對成員ID或名稱進行修改, 請在bot可以讀取到的頻道中裡面呼叫 !reload
- 之後可以使用!help指令來取得相關功能說明

> forever stopall
- 要關掉時可以用這個

### - 開發者群組(其實只有一個人)
如果有問題或想討論的, 可以到此群組
https://discord.gg/mjmtcc2