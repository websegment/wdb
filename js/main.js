/**
 * Web SQL Database sample script
 * 
 * ちょっとテストで作ってみる。
 * 色々スクリプト触っちゃって下さい。
 * Google Chrome（Webkit系）のみ動作確認してます。
 * 
 * @author Daisuke Sakata
 * @copyright websegment.net
 */
/**
 * データベース用変数
 */
var db;
/**
 * DOM読み込み完了時の処理
 * 
 * データベースのオープンを行う。
 * 追加ボタンにonlcickイベントのハンドラを追加。
 * テーブル削除ボタンにonclickイベントのハンドラを追加。
 * 検索ボタンにonclickイベントのハンドラを追加。
 * 初期処理を行う。
 * テーブル内の情報を取得する。
 */
$(function(){
    db = openDatabase("main", 1, "MainDB", 1024 * 1024);
    $("#add").click(addClickHandler);
    $("#drop-table").click(dropTableHandler);
    $("#push-search").click(searchHandler);
    $("#update").click(updateHandler);
    initialize();
    load();
});
//Event handler functions==============================================
/**
 * 追加ボタンクリックハンドラ
 * 
 * 入力値を取得
 * 入力値のチェックを行う
 * エラーメッセージが存在しない場合
 *   insert処理へ進む。
 * エラーメッセージがある場合
 *   アラートを表示する
 * 
 * @see sql.js.insertBookmark(inputData)
 */
function addClickHandler(){
    var title = $("#title").val();
    var url = $("#url").val();
    var note = $("#note").val();
    var inputData = new Object();
    inputData.title = title;
    inputData.url = url;
    if(note != ""){
        inputData.note = note;
    }
    var error = checkValidate(inputData);
    if(error.length <= 0){
        //add(inputData);
        db.transaction(function(tx){
            tx.executeSql(insertBookmark(inputData));
        }, insertException, insertSuccess);
    }else{
        alert(error.join("\n"));
    }
}
/**
 * タイトルクリック時のイベント処理
 * 
 * 引数のIDに該当する情報を取得する
 * 
 * @see sql.js.selectBookmarkInfo(inId)
 * @param inId int
 */
function selectItem(inId){
    db.transaction(function(tx){
        tx.executeSql(selectBookmarkInfo(inId), null, setBookmarkInfo);
    });
    //return false;
}
/**
 * ブックマークの更新処理を行う。
 * 
 * 入力値チェックを行う。
 * エラーメッセージが0件以下の場合
 * 　更新処理を行う。
 * 　画面のリフレッシュ（location.hrefで代用）
 * エラーメッセージが１件以上の場合
 * 　アラートを表示。
 * 
 * @see sql.js.updateBookmarkInfo(inputData, id)
 */
function updateHandler(){
    var title = $("#title").val();
    var url = $("#url").val();
    var note = $("#note").val();
    var inputData = new Object();
    inputData.title = title;
    inputData.url = url;
    if(note != ""){
        inputData.note = note;
    }
    var error = checkValidate(inputData);
    if(error.length <= 0){
        //update(inputData, $("#id").val());
        db.transaction(function(tx){
            tx.executeSql(updateBookmarkInfo(inputData, $("#id").val()));
        }, exception, function(){
            location.href = "index.html";
        });
    }else{
        alert(error.join("\n"));
    }
}
/**
 * ブックマーク情報の削除を行う。
 * 
 * 最終確認ダイヤログを表示し、OKであれば削除処理（UPDATE）を行う。
 * 処理後、画面のリフレッシュ（location.hrefで代用）
 * 
 * @see sql.js.updateBookmarkInfoDelete(inId)
 */
function deleteItem(inId){
    if(confirm("削除します、よろしいですか？")){
        db.transaction(function(tx){
            tx.executeSql(updateBookmarkInfoDelete(inId));
        }, exception, function(){
            location.href = "index.html";
        });
    }else{
        return false;
    }
}
/**
 * テーブル削除処理
 * 
 * ユーザに確認ダイヤログを表示し、OKをクリックすれば、テーブルを削除する
 * 
 * @see sql.js.dropTable(String tableName)
 */
function dropTableHandler(){
    if(confirm("登録した情報は全て削除されます。よろしいですか？")){
        db.transaction(function(tx){
            tx.executeSql(dropTable("bookmarks"), null, setBookmarkList);
            //tx.executeSql(dropDatabase(), null, setBookmarkList);
        });
    }
}
/**
 * 検索処理を行う。
 * 
 * 検索ボックスに入力されている値を取得
 * 入力値がある場合
 *  入力値の文字列で検索を行う。
 * 入力値がない場合
 *  全件検索処理を行う。
 * 
 * @see sql.js.selectSearchBookmarks(searchText)
 * @see sql.js.selectBookmarks()
 */
function searchHandler(){
    var searchText = $("#search").val();
    db.transaction(function(tx){
        if(searchText != ""){
            tx.executeSql(selectSearchBookmarks(searchText), null, setBookmarkList);
            //tx.executeSql(dropDatabase(), null, setBookmarkList);
        }else{
            tx.executeSql(selectBookmarks(), null, setBookmarkList);
        }
    });
}
//Main=============================================================
/**
 * 初期化処理
 * 
 * テーブルが存在しない場合はテーブルを作成
 * SQLエラーが発生した場合はExceptionへジャンプ
 * 
 * @see sql.js.createTable()
 */
function initialize(){
    $("#update").hide();
    db.transaction(function(tx){
        tx.executeSql(createTable());
    }, exception);
}
/**
 * データベース内の一欄を表示する
 * 
 * 検索結果が正常に取得できた場合、htmlテーブル表示処理へ進む。setBookmarkList
 * 
 * @see sql.js.selectBookmarks()
 */
function load(){
    db.transaction(function(tx){
        tx.executeSql(selectBookmarks(), null, setBookmarkList);
    });
}
/**
 * ブックマークリストを表示する処理
 * 
 * 既にHTML上に表示されているエリア（table）を初期化
 * 検索結果からテーブルを生成
 * 
 * @param tx Nothing
 * @param rs ResultSet
 */
function setBookmarkList(tx, rs){
    var bookmarkList = $("#bookmark-list");
    bookmarkList.empty();
    bookmarkList.append(getTable(rs));
}
/**
 * 取得したブックマーク情報をフォーム要素に挿入
 * 更新の為、bookmark_idをhidden値に設定
 */
function setBookmarkInfo(tx, rs){
    var row = rs.rows;
    if(row.length == 1){
        var hiddenId = $(document.createElement("input"));
        var item = row.item(0);
        $("#update").show();
        $("#add").hide();
        
        $("#title").val(item.title);
        $("#url").val(item.url);
        $("#note").val(item.note);
        $("#input-form").append(hiddenId.attr({"type":"hidden", "id":"id", "value":item.bookmark_id}));
    }
}
//HTML tag functions==========================================================
/**
 * HTMLテーブルタグのセット生成処理
 * 
 * 検索結果の取得行数が0件以上の場合
 *  テーブルタグの生成
 *  thタグ群の生成
 * 　入力値のResultSet分だけ繰り返し処理
 * 　　ResultSetの内容を１行毎にtr,tdの生成
 * 検索結果の取得行数が0件だった場合
 *  登録情報無しメッセージを設定
 * 
 * @param r ResultSet
 * @return Object
 */
function getTable(r){
    var row = r.rows;
    if(row.length > 0){
        var table = $(document.createElement("table"));
        table.attr("border", "1");
        table.append(getTableHeader());
        for(var i = 0; i < row.length; i++){
            table.append(getTableLine(row.item(i)));
        }
    }else{
        table = "現在登録情報はありません";
    }
    return table;
}
function getTableLine(bm){
    var tr = $(document.createElement("tr"));
    var title = '<a href="#wsdb" onclick="return selectItem(' + bm.bookmark_id + ')">' + bm.title + '</a>';
    var deleteButton = '<a href="#wsdb" onclick="return deleteItem(' + bm.bookmark_id + ')">削除</a>';
    var url = '<a href="' + bm.url + '" target="_blank">' + bm.url + '</a>';
    tr.append(getTd(bm.bookmark_id));
    tr.append(getTd(title));
    tr.append(getTd(url));
    tr.append(getTd(nl2br(escape(bm.note))));
    tr.append(getTd(bm.create_date));
    tr.append(getTd(bm.update_date));
    tr.append(getTd(deleteButton));
    return tr;
}
function getTableHeader(){
    var tr = $(document.createElement("tr"));
    tr.append(getTh("id"));
    tr.append(getTh("タイトル"));
    tr.append(getTh("URL"));
    tr.append(getTh("備考"));
    tr.append(getTh("作成日時"));
    tr.append(getTh("更新日時"));
    tr.append(getTh(" "));
    return tr;
}
function getTd(text){
    var td = $(document.createElement("td"));
    if(text == null){
        text = "<i>null</i>";
    }
    td.html(text);
    return td;
}
function getTh(text){
    var th = $(document.createElement("th"));
    th.html(text);
    return th;
}
//multi functions===================================================
function exception(e){
    alert(e.message);
}
function insertException(e){
    exception(e);
}
function insertSuccess(tx, rs){
    location.href = "index.html";
}
function success(){
    alert("success");
}
/**
 * 入力チェック関数
 * 
 * タイトル、URLの必須チェックを行う。
 * タイトルの未入力の場合エラー
 * URLの未入力の場合エラー
 * URLフォーマットチェックの場合エラー
 * 
 * @param inData Object
 * @return errorMessages Array
 */
function checkValidate(inData){
    var errorMessages = new Array();
    if(inData.title == ""){
        errorMessages.push("タイトルを入力してください");
    }
    if(inData.url == ""){
        errorMessages.push("URLを入力してください");
    }else if(!inData.url.match("^http:\/\/")){
        errorMessages.push("URLにはhttp://から入力してください");
    }
    return errorMessages;
}
/**
 * 改行コードからbrタグへ変換
 * 
 * @param str String
 * @return String
 */
function nl2br(str){
    if(str != null){
        return str.replace(/(\r\n|\n)/gi, "<br />");
    }else{
        return null;
    }
}
/**
 * HTMLエスケープをする
 * 
 * 参照元：http://phpspot.org/blog/archives/2007/11/javascript_html.html
 * 
 * @param ch String
 * @return ch String
 */
function escape(ch) { 
    ch = ch.replace(/&/g,"&amp;") ;
    ch = ch.replace(/"/g,"&quot;") ;
    ch = ch.replace(/'/g,"&#039;") ;
    ch = ch.replace(/</g,"&lt;") ;
    ch = ch.replace(/>/g,"&gt;") ;
    return ch ;
}