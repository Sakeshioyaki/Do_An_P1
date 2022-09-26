// crawl data from phongtro123

import rp from "request-promise";
import cheerio from "cheerio";
import fs from "fs";
import databaseHandle from "./databaseHandle.js";
import encodeAddress from "./encodeAddress.js";
import handleAddress from "./detailAddress.js";

let numberUser = 0;

// lay danh sach tinh thanh
var tinhthanh = fs.readFileSync("dstinh2.txt").toString().split("\n");

//link original
const link = "https://homedy.com/";
const linkRoom = "https://homedy.com/cho-thue-nha-tro-phong-tro";
const linkHouse = "https://homedy.com/cho-thue-nha-rieng";
const linkApartment = "https://homedy.com/cho-thue-can-ho-chung-cu";

//dem so ban ghi
let count = 0;

//laydata tu link
async function getDataFromLink(runningLink, phone, type) {
  console.log("getdata from ", runningLink);
  try {
    const options = {
      uri: runningLink,
      transform: function (body) {
        //Khi lấy dữ liệu từ trang thành công nó sẽ tự động parse DOM
        return cheerio.load(body);
      },
    };
    var $ = await rp(options);
  } catch (error) {
    console.log("Link dang dung:" + runningLink);
    return error;
  }
  //get img
  let listImg = [];
  const imgContent = $(".product > .image-view > .container > .image-carousel");
  const imgDefault = imgContent.find("img");

  for (let i = 0; i < imgDefault.length; i++) {
    let item = $(imgDefault[i]);
    let linkImg = item.attr("data-src");
    listImg.push(linkImg);
  }

  const product = $(".product > .float-in  > .product-item").find(".container");

  //get title
  const title = product
    .find(".product-detail-top-left")
    .find("h1")
    .text()
    .trim();
  console.log(title);

  //get date
  const dateT = product.find(".product-detail-top-left").find(".date-created");
  let date = $(dateT[0]).text().trim();
  var today = new Date();
  if (date.indexOf("phút") != -1 || date.indexOf("giờ") != -1) {
    date =
      today.getDate() +
      "/" +
      (today.getMonth() + 1) +
      "/" +
      today.getFullYear();
  } else if (date.indexOf("ngày") != -1) {
    let dayLeft = Number(date[date.indexOf("ngày") - 2]);
    today.setDate(today.getDate() - dayLeft);
    date =
      today.getDate() +
      "/" +
      (today.getMonth() + 1) +
      "/" +
      today.getFullYear();
  } else if (date.indexOf("tuần") != -1) {
    let dayLeft = Number(date[date.indexOf("tuần") - 2]) * 7;
    today.setDate(today.getDate() - dayLeft);
    date =
      today.getDate() +
      "/" +
      (today.getMonth() + 1) +
      "/" +
      today.getFullYear();
  }

  console.log(date);

  //detail content
  const information = product.find("#readmore").find("p").text();

  const productDetail = product
    .find(".product-detail")
    .find(".cell.cell-right");

  //get price
  const price = $(productDetail[0]).text().trim().replace(/\n|\r/g, " ");

  //get square
  const square = $(productDetail[1]).text().trim().replace(/\n|\r/g, "");

  //get name
  const useName = product.find(".text-name").text().trim();
  console.log(useName);

  //get address
  var address = product
    .find(".product-detail-top-left")
    .find(".address")
    .find("a")
    .find("span")
    .text()
    .trim();
  address = address.slice(address.indexOf("Đường") || address.indexOf("Phố"));
  const address2 = product
    .find(".product-detail-top-left")
    .find(".address")
    .find("span");
  const streetAddress = product
    .find(".product-detail-top-left")
    .find(".address")
    .find("a")
    .find("span")
    .text();
  if (streetAddress != undefined)
    console.log("stressAddress : ", streetAddress);
  else console.log("undefined address");
  for (let i = 1; i <= 3; i++) {
    let item = $(address2[i]).text().trim();
    address = address + " " + item;
  }
  console.log("address", address);
  //get detail adress
  const addressDetail = await handleAddress.getDetailAddress(address);

  if (type == 1 || type == 3) {
    type == 1 ? "house" : "apartment";
  } else {
    type = "room";
  }

  const newItem = {
    user: { use_name: useName, phone: phone },
    url: runningLink,
    data: {
      type: type,
      title: title,
      address: address,
      address_detail: addressDetail,
      price: price,
      square: square,
      kitchens: 0,
      floors: 0,
      bedrooms: 0,
      info: information,
      date: date,
      list_Img_Url: listImg,
    },
  };

  const docID = await encodeAddress.encodeAddress(addressDetail);
  if (docID !== -1) {
    console.log("id ", docID);

    const pathData = await databaseHandle.database_set(dataCrawl, docID);
    console.log("pathData : " + pathData[1]);
    if (pathData[1] == 1) {
      const useref = {
        use_name: useName,
        phone: phone,
        list_post: [{ codeAddress: docID, id_nhatro: pathData[0] }],
        type: 0, //0: user get by crawl from web , 1 : user from sevieces
      };
      console.log("go t o there");
      console.log("object:", useref);
      const id_user = await databaseHandle.add_user_data(useref);
    }
    numberUser++;
    console.log(numberUser);
  }
}

async function crawler(runningLink) {
  // await sleep(1000);
  try {
    const options = {
      uri: runningLink,
      transform: function (body) {
        //Khi lấy dữ liệu từ trang thành công nó sẽ tự động parse DOM
        return cheerio.load(body);
      },
    };
    var $ = await rp(options);
  } catch (error) {
    console.log("Link dang dung:" + runningLink);
    console.log(error);
    return error;
  }
  const content = $(".tab-content");
  const listProduct = content.find(".product-item");

  for (let i = 0; i < listProduct.length; i++) {
    //get phone
    let item = $(listProduct[i]);
    let chat = item
      .find(".product-item-top")
      .find(".box-price-agency > span")
      .attr("onclick");

    //tach chuoi
    let firstIndex = chat.indexOf(",");
    let secondIndex = chat.indexOf("'", firstIndex + 3);
    let phone = chat.slice(firstIndex + 3, secondIndex);

    //get link
    const currentLink = link + item.find(".product-item-top > a").attr("href");
    await getDataFromLink(currentLink, phone);
  }
}

async function crawl_room() {
  console.log("START - Crawl room");
  let i, j;
  for (i = 0; i < 63; i++) {
    console.log("duyet :" + tinhthanh[i]);
    for (j = 1; j <= 3; j++) {
      let currentLink = linkRoom + "-" + tinhthanh[i] + "/p" + j;
      await crawler(currentLink, j, 0);
    }
  }
}

async function crawl_apartment() {
  let i, j;
  for (i = 0; i < 63; i++) {
    console.log("duyet :" + tinhthanh[i]);
    for (j = 1; j <= 3; j++) {
      let currentLink = linkApartment + "-" + tinhthanh[i] + "/p" + j;
      await crawler(currentLink, j, 3);
    }
  }
}
async function crawl_house() {
  let i, j;
  for (i = 0; i < 63; i++) {
    console.log("duyet :" + tinhthanh[i]);
    for (j = 1; j <= 3; j++) {
      let currentLink = linkHouse + tinhthanh[i] + "/p" + j;
      await crawler(currentLink, j, 1);
    }
  }
}

async function homedy() {
  console.log("START - Crawl from homedy.vn ");
  await crawl_room();
  await crawl_house();
  await crawl_apartment();
}
export default { homedy };
