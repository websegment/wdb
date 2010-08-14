/**
 * SQL文を生成する為のスクリプト
 * 
 * なんなりと触っちゃってくださいｗ
 * 
 * @author Daisuke Sakata
 * @copyright websegment.net
 */
 /**
  * テーブル作成処理
  * 
  * 既に同じテーブルが存在すれば、作成を中止
  * テーブルが存在しなければテーブル作成
  * 
  * @return sql String
  */
function createTable(){
  var sql = 'CREATE TABLE IF NOT EXISTS "bookmarks"('
      + '"bookmark_id" INTEGER PRIMARY KEY  AUTOINCREMENT  NOT NULL ,'
      + '"title" VARCHAR,'
      + '"url" VARCHAR,'
      + '"note" VARCHAR,'
      + '"create_date" DATETIME,'
      + '"update_date" DATETIME,'
      + '"delete_flag" INTEGER);';
  return sql;
}
/**
 * 全件検索を行う。
 * 
 * 削除フラグが0（未削除）、ソート順が作成日時の降順
 * このORDER BYが変！！！バグってます。
 * 日付型でテーブルを作成するのは良くないのかな？UTCでINTEGER型でブッコむのが無難か。調査中。
 * 
 * @return sql String
 */
function selectBookmarks(){
  var sql = "SELECT * FROM bookmarks WHERE delete_flag = 0 ORDER BY create_date DESC";
  return sql;
}
/**
 * URL検索を行う。
 * 
 * 入力された文字列の部分一致で検索を行う。
 * 削除フラグが0（未削除）、ソート順が作成日時の降順
 * 
 * @param searchString String
 * @return sql String
 */
function selectSearchBookmarks(searchString){
    var sql = "SELECT * FROM bookmarks WHERE url LIKE '%" + searchString + "%' AND delete_flag = 0 ORDER BY create_date DESC";
    return sql;
}
/**
 * ブックマーク情報の取得を行う。
 * 
 * 入力値のIDを元に該当するブックマーク情報を取得する。
 * 
 * @param id int
 * @return sql String
 */
function selectBookmarkInfo(id){
    var sql = "SELECT bookmark_id, title, url, note FROM bookmarks WHERE bookmark_id = " + id + " AND delete_flag = 0";
    //alert(sql);
    return sql;
}
/**
 * テーブルの削除を行う。
 * 
 * @param tableName String
 * @return sql String
 */
function dropTable(tableName){
  var sql = "DROP TABLE " + tableName;
  return sql;
}
/**
 * データベースの削除を行う。
 * 
 * これ実行できてるか不明。
 * 
 * @return sql String
 */
function dropDatabase(){
  var sql = "DROP DATABASE main";
  return sql;
}
/**
 * ブックマーク情報の登録を行う。
 * 
 * 作成日時、更新日時に初期処理として、現在日時を設定する。
 * 削除フラグに0（未削除）を設定する。
 * 入力値（オブジェクト）をプロパティの数分繰り返す
 * 　プロパティ名をフィールド名配列に追加
 * 　プロパティ値が数字の場合
 * 　　プロパティ値配列に追加
 * 　プロパティ値が数字以外の場合
 * 　　プロパティ値をシングルクォーテーションで囲み、プロパティ値配列に追加
 * 
 * フィールド名配列が1以上、且つ、プロパティ値配列が1以上且つ、フィールド名配列とプロパティ値配列の数が一致する場合
 * 　INSERT文の作成、それぞれのフィールド名とプロパティ値をカンマ区切りで文字列連結する
 * 
 * @param insertData Object
 * @return sql String
 */
function insertBookmark(insertData){
    var sql;
    var fieldNames = new Array();
    var values = new Array();
    insertData.create_date = getNowDate();
    insertData.update_date = getNowDate();
    insertData.delete_flag = 0;
    for(var field in insertData){
        fieldNames.push(field);
        if(!isNaN(insertData[field])){
          values.push(insertData[field]);
        }else{
          values.push("'" + insertData[field] + "'");
        }
    }
    if(fieldNames.length > 0 && values.length > 0 && fieldNames.length == values.length){
        sql = "INSERT INTO bookmarks(" + fieldNames.join(", ") + ") VALUES(" + values.join(", ") + ")";
    }
    alert(sql);
    return sql;
}

/**
 * ブックマーク情報の更新を行う。
 * 
 * 更新日時に現在日時を設定する
 * 入力値（オブジェクト）のプロパティの数分繰り返す
 * 　プロパティ値が数字のみの場合
 * 　　SET値にプロパティ名とその値を追加
 * 　プロパティ値が数字以外の場合
 * 　　SET値にプロパティ名とシングルクオーテーションで囲った値を追加
 * UPDATE文の生成
 * 
 * @param updateData Object
 * @param id int
 * @return sql String
 */
function updateBookmarkInfo(updateData, id){
    var set = new Array();
    updateData.update_date = getNowDate();
    for(var field in updateData){
        if(!isNaN(updateData[field])){
          set.push(field + " = " + updateData[field]);
        }else{
          set.push(field + " = " + "'" + updateData[field] + "'");
        }
    }
    var sql = "UPDATE bookmarks SET " + set.join(", ") + " WHERE bookmark_id = " + id + " AND delete_flag = 0";
    alert(sql);
    return sql;
}
/**
 * ブックマーク情報を削除する（論理削除）
 * 
 * 更新日時を現在日時に設定
 * 入力値のIDに該当する情報を更新する
 * 
 * @param id int
 * @return sql String
 */
function updateBookmarkInfoDelete(id){
    var update_date = getNowDate();
    var sql = "UPDATE bookmarks SET delete_flag = 1, update_date = '" + update_date + "' WHERE bookmark_id = " + id + " AND delete_flag = 0";
    alert(sql);
    return sql;
}
/**
 * 現在日付を取得する
 * 
 * @return String
 */
function getNowDate(){
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth();
    var date = now.getDate();
    var hours = now.getHours();
    var minutes = now.getMinutes();
    var seconds = now.getSeconds();
    return year + "-" + month + "-" + date + " "  + hours + ":" + minutes + ":" + seconds;
}