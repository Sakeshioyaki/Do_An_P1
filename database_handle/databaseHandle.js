import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

import serviceAccount from "./key2.js";

initializeApp({
  credential: cert(serviceAccount),
});
const db = getFirestore();

function removeVietnameseTones(str) {
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
  str = str.replace(/Đ/g, "D");
  // Some system encode vietnamese combining accent as individual utf-8 characters
  // Một vài bộ encode coi các dấu mũ, dấu chữ như một kí tự riêng biệt nên thêm hai dòng này
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // ̀ ́ ̃ ̉ ̣  huyền, sắc, ngã, hỏi, nặng
  str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // ˆ ̆ ̛  Â, Ê, Ă, Ơ, Ư
  // Remove extra spaces
  // Bỏ các khoảng trắng liền nhau
  str = str.replace(/ + /g, " ");
  str = str.trim();
  // Remove punctuations
  // Bỏ dấu câu, kí tự đặc biệt
  str = str.replace(
    /!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g,
    " "
  );
  return str;
}

async function database_set(data, id) {
  console.log("come id :" + id);
  const data_nha_tro = db.collection("post2");

  const idNhaTro =
    id +
    " " +
    (await removeVietnameseTones(data.addressDetail.stress)) +
    " " +
    (await removeVietnameseTones(data.addressDetail.more)) +
    " " +
    (await removeVietnameseTones(data.title));
  const check = await data_nha_tro.doc(idNhaTro);
  const isExits = await check.get();
  if (!isExits.exists) {
    await data_nha_tro.doc(idNhaTro).set(data);
    console.log("da add data ");
    return [idNhaTro, 1];
  }

  return [isExits.id, 0];
}

async function add_user_data(user) {
  let result;
  const data_user = db.collection("user");
  let current_post_list;
  if (typeof (user.phone instanceof Object)) {
    result = await data_user.where("phone", "in", [user.phone]).get();
    if (result.empty) {
    } else {
      result.forEach((doc) => {
        current_post_list = user.list_post.concat(doc.data().list_post);
        data_user.doc(doc.id).update({ list_post: current_post_list });
        console.log("had update");
        return [doc.id, 1];
      });
    }
  } else {
    // neu la dang string
    result = await data_user.where("phone", "==", user.phone).get();
    if (result.empty) {
    } else {
      result.forEach((doc) => {
        current_post_list = user.list_post.concat(doc.data().list_post);
        data_user.doc(doc.id).update({ list_post: current_post_list });
        console.log("update post_list ");

        return [doc.id, 1];
      });
    }
  }

  const getId = await data_user.add(user);
  return [getId.id, 0];
}

export default { database_set, add_user_data };
