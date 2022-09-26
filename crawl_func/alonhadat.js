/* crawl data from htt
ps://alonhadat.com.vn/
 *********************************************
 input :    Link origin -  https://alonhadat.com.vn/nha-dat/cho-thue/phong-tro-nha-tro
            file danh sách tỉnh thành : dsting.txt
  output :  file json - alonhadat.json
 *********************************************
*/

import rp from "request-promise";
import cheerio from "cheerio";
import fs from "fs";
import encodeAddress from "./encodeAddress2.js";
import databaseHandle from "./databaseHandle.js";
import handleAddress from "./detailAddress.js";
import handleCost from "./handleCost.js";

//ko su dung den - de du phong
let numberUser = 0;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// lay danh sach tinh thanh
var tinhthanh = fs.readFileSync("dstinh.txt").toString().split("\n");
const linkRoom = "https://alonhadat.com.vn/nha-dat/cho-thue/phong-tro-nha-tro/";
const linkHouse = "https://alonhadat.com.vn/cho-thue-nha-";
const linkApartment =
  "https://alonhadat.com.vn/nha-dat/cho-thue/can-ho-chung-cu/";
async function getPhone(linkchay, data) {
  try {
    const options = {
      uri: linkchay,
      transform: function (body) {
        return cheerio.load(body);
      },
    };
    var $ = await rp(options);
  } catch (error) {
    return error;
  }
  const mainInfo = $(".phone");
  // console.log(mainInfo.find("a").text());
  await sleep(1000);
  let phoneList = mainInfo.find("a");
  let phone = [];
  if (phoneList.length > 1) {
    for (let i = 0; i < phoneList.length; i++) {
      let item = $(phoneList[i]);
      phone.push(item.text());
    }
    return phone;
  }
  return phoneList.text();
}

async function getDataFromLink(linkchay, type) {
  await sleep(1000);
  try {
    const options = {
      uri: linkchay,
      transform: function (body) {
        //Khi lấy dữ liệu từ trang thành công nó sẽ tự động parse DOM
        return cheerio.load(body);
      },
    };
    var $ = await rp(options);
  } catch (error) {
    return error;
  }

  const content = $(".content.plp");

  //get title
  const title = content.find(".title > h1").text().trim();

  //get date
  var dateTetx = content.find(".date").text().trim();
  var date = dateTetx.slice(11);
  if (date == "Hôm nay") {
    var today = new Date();
    date =
      today.getDate() +
      "/" +
      (today.getMonth() + 1) +
      "/" +
      today.getFullYear();
  }
  if (date == "Hôm qua") {
    var yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    date =
      yesterday.getDate() +
      "/" +
      (yesterday.getMonth() + 1) +
      "/" +
      yesterday.getFullYear();
  }
  // console.log(date);

  //detail content
  const information = content.find(".detail.text-content").text().trim();

  //get price
  let price = content.find(".moreinfor > .price > .value").text().trim();
  let price2 = await handleCost.formatCost(price);

  //get square
  const square = content.find(".moreinfor > .square > .value").text();

  //get name
  const useName = content
    .find("#right > .contact > .contact-info >  .content > .name")
    .text()
    .trim();

  //get address
  const address = $("#left > .property > .address > .value").text();

  //get detail adress
  const addressDetail = await handleAddress.getDetailAddress(address);

  //list img
  const imgContain = $("#left > .property > .images");
  let listImg = "";
  const firstImg =
    "https://alonhadat.com.vn" +
    imgContain.find(".imageview > #limage").attr("src");
  const img = imgContain.find(".image-list").find(".limage");
  listImg = firstImg;
  for (let i = 0; i < img.length; i++) {
    let item = $(img[i]);
    let new_img = item.attr("src");
    listImg = listImg + "," + ("https://alonhadat.com.vn" + new_img);
  }

  //get phone
  const contentPhone = content
    .find("#right > .contact > .contact-info >  .content > .view-more > a")
    .attr("href");
  // console.log(contentPhone);
  let phone = [];
  if (contentPhone != undefined) {
    phone = await getPhone("https://alonhadat.com.vn/" + contentPhone);
  }

  const newAddressDetail = await encodeAddress.encodeAddress(addressDetail);
  if (newAddressDetail == -1) {
    console.log("loi dia chi ko add data");
    return;
  }

  const dataCrawl = {
    user: { use_name: useName, phone: phone },
    url: linkchay,
    nameWeb: "alonhadat.vn",
    favorite: null,
    postType: 2, // data co dc do crawl
    roomType: type,
    title: title,
    // address: address,
    addressDetail: newAddressDetail[1],
    price: price2,
    square: square,
    info: information,
    date: date,
    listImgUrl: listImg,
  };

  if (newAddressDetail[0] !== -1) {
    const idNhaTro = await databaseHandle.database_set(
      dataCrawl,
      newAddressDetail[0]
    );
    if (idNhaTro[1] == 1) {
      // data da dc add
      const userInfo = {
        use_name: useName,
        phone: phone,
        list_post: [{ id_nhatro: idNhaTro[0] }],
        type: 0, //0: user get by crawl from web , 1 : user from sevieces
      };

      const id_user = await databaseHandle.add_user_data(userInfo);
      numberUser++;
      console.log(numberUser);
    } else {
      console.log("Thong tin nha tro da ton tai trong he thong");
    }
  } else {
    console.log(
      "Encode Address. Ward of Address has NULL or address does not exist or system error "
    );
  }
}

async function crawler(linkchay, type) {
  //ham nay la ham goi dau tien :P no duyet 1 list data
  try {
    const options = {
      uri: linkchay,
      transform: function (body) {
        //Khi lấy dữ liệu từ trang thành công nó sẽ tự động parse DOM
        return cheerio.load(body);
      },
    };
    var $ = await rp(options);
  } catch (error) {
    return error;
  }

  const contentBody = $("#content-body");
  const contentItem = contentBody.find(
    "#left > .content-items > .content-item"
  );

  for (let i = 0; i < contentItem.length; i++) {
    let item = $(contentItem[i]).find(".ct_title > a ").attr("href");
    await getDataFromLink("https://alonhadat.com.vn/" + item, type);
  }
}

async function crawl_room() {
  let i,
    j = 0;
  console.log("tim kiem rooom ------------------");
  for (i = 0; i < 63; i++) {
    console.log("duyet :" + tinhthanh[i]);
    for (j = 2; j <= 8; j++) {
      let currentLink =
        linkRoom +
        "/" +
        (i + 1) +
        "/" +
        tinhthanh[i] +
        "/" +
        "trang--" +
        j +
        ".html";
      await crawler(currentLink, 0);
      console.log("dang duyet : " + currentLink);
    }
  }
}

async function crawl_house() {
  console.log("tim kiem nha ------------------");
  let i, j;
  for (i = 0; i < 63; i++) {
    console.log("duyet :" + tinhthanh[i]);

    for (j = 1; j <= 8; j++) {
      let currentLink = linkHouse + tinhthanh[i] + "-t" + j + ".htm";
      await crawler(currentLink, 1);
      console.log("dang duyet : " + currentLink);
    }
  }
}

async function crawl_apartment() {
  console.log("tim kiem nha ------------------");
  let i, j;
  for (i = 0; i < 63; i++) {
    console.log("duyet :" + tinhthanh[i]);
    for (j = 1; j <= 8; j++) {
      let currentLink =
        linkApartment +
        "/" +
        i +
        "/" +
        tinhthanh[i] +
        "/" +
        "trang--" +
        j +
        ".htm";
      await crawler(currentLink, 3);
      console.log("dang duyet : " + currentLink);
    }
  }
}

async function alonhadat() {
  console.log("START - Crawl from alonhadat.vn ");
  await crawl_room();
  await crawl_house();
  await crawl_apartment();
}
export default { alonhadat };