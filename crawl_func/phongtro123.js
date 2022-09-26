// crawl data from phongtro123

/* crawl data from https://phongtro123.com/";
 *********************************************
 input :    Link origin -  https://phongtro123.com/";
            file danh sách tỉnh thành : dsting.txt
  output :  file json - alonhadat.json
 *********************************************
 >> Dữ liệu lấy từ 63 tỉnh thành * 20 kết quả tìm kiếm trang đầu tiên 
  định dạng dữ liệu json 
 {
   "user":{
      "useName":"Lực",
      "phone":"0969.139.826"
   },
   "data":{
      "title":"CC CHO THUÊ PHÒNG 35M2 KIỂU CCMINI 1N1K TẠI MỄ TRÌ, NAM TỪ LIÊM (CẠNH TRƯỜNG CẤP 1 MỄ TRÌ)",
      "address":" Số nhà 12, ngõ 89 Đường Mễ Trì Thượng, Phường Mễ Trì, Quận Nam Từ Liêm, Hà Nội",
      "price":"4,7 triệu / tháng",
      "square":" 35 m2",
      "info":"Chính chủ cho phòng kiểu CCMN tại số 12, ngõ 89 Mễ Trì Thượng, Mễ Trì, Nam Từ Liêm (cuối ngõ 4 Đồng Me đi vào khoảng 30m) diện tích 35m2, 1 ngủ 1 khách, bếp ngăn riêng biệt với phòng không lo ám mùi.\n\n  - Vị trí: cách mầm non Mễ Trì Hạ 50m, cách trường cấp 1&2 Mễ trì 50m, cách chợ Mễ Trì Hạ 100m, cách đường Mễ Trì 150m, cách đường Lê Quang Đạo 200m, cách The Garden 200m, cách Keangnam Phạm Hùng 500m...\n\n  - TIỆN ÍCH:\n+ Nhà đã có đủ đồ như: điều hòa, nóng lạnh, tủ lạnh, máy giặt, giường, tủ, táp, bàn phấn, rèm, bàn ghế, tủ bếp, bếp từ, wifi tốc độ cao...\n+ Khu bếp ngăn tách riêng phòng ngủ\n+ Có cửa sổ thoáng mát \n+ Để xe miễn phí\n+ Giờ giấc thoải mái\n+ Khóa vân tay, camera từng tầng, wifi từng phòng\n+ Thang máy\n+ Ô tô 16 chỗ vào sát nhà\n+ Bãi gửi ôtô cách nhà 50m\n+ Có vệ sinh lau dọn hàng tuần sạch sẽ\n\n- Diện tích: 35m2\n- Giá: 4.7tr/tháng\n\n💯Cam kết Phòng như hình\n\n(Nhà mới sạch sẽ, khách chỉ việc xách vali vào ở)",
      "date":"20/12/2021",
      "list_Img_Url":[
         "https://alonhadat.com.vn/files/properties/2021/3/10/images/07930379-1702-cho-thue-phong-tro-nha-tro-quan-nam-tu-liem-chinh-chu.jpg"
      ]
   }
 }
*/
import rp from "request-promise";
import cheerio from "cheerio";
import fs from "fs";
import encodeAddress from "./encodeAddress.js";
import databaseHandle from "./databaseHandle.js";
import handleAddress from "./detailAddress2.js";
import handleCost from "./handleCost.js";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// lay danh sach tinh thanh
var tinhthanh = fs.readFileSync("dstinh2.txt").toString().split("\n");

//link original
const link = "https://phongtro123.com/";
const linkroom = "https://phongtro123.com/tinh-thanh/";
const linkhouse = "https://phongtro123.com/cho-thue-nha-nguyen-can-";
const linkapartment = "https://phongtro123.com/cho-thue-can-ho-chung-cu-";

//ko su dung den - de du phong
let numberUser = 0;

//laydata tu link
async function getdataFromLink(linkchay, type) {
  console.log("Link dang dung:" + linkchay);

  try {
    const options = {
      uri: linkchay,
      transform: function (body) {
        return cheerio.load(body);
      },
    };
    var $ = await rp(options);
  } catch (error) {
    console.log("Link dang dung:" + linkchay);
    return error;
  }
  const ul = $(".page-header");
  //get tittle
  const title = ul.find("a").text().trim();

  //get address
  let address = ul.find(".post-address").text().trim();
  let indexOfDiaChi = address.indexOf("Địa chỉ:");
  address = address.substring(indexOfDiaChi + 9, address.length);
  console.log("address : ", address);

  //get detail adress
  const addressDetail = await handleAddress.getDetailAddress(address);

  //get price
  const price = ul
    .find(".post-attributes")
    .find(".item.price")
    .find("span")
    .text()
    .trim();
  let price2 = await handleCost.formatCost(price);

  //get acreage
  const square = ul
    .find(".post-attributes")
    .find(".item.acreage")
    .find("span")
    .text()
    .trim();

  //get phone & userName
  const contact = $(".section.post-contact > .section-content > .table")
    .find("tr")
    .find("td");
  const useName = $(contact[1]).text().trim();
  const phone = $(contact[3]).text().trim();

  //get content
  const content = $(".section.post-main-content > .section-content").find("p");
  var information = "";
  for (let i = 0; i < content.length; i++) {
    const item = $(content[i]);
    const info = item.text().trim();
    information = information + " " + info;
  }

  //get img
  const post_image = $(".post-images");
  const img = post_image.find(".swiper-slide").find("img");
  let listImg = "";

  for (let i = 0; i < img.length; i++) {
    let item = $(img[i]);
    let new_img = item.attr("src");
    if (listImg == "") {
      listImg = new_img;
    } else {
      listImg = listImg + "," + new_img;
    }
  }

  //get date post
  const sectionDate = $(
    ".section.post-overview >.section-content > .table  > tbody > tr"
  );
  const date = $(sectionDate[5]).find("time").attr("title");

  const newAddressDetail = await encodeAddress.encodeAddress(addressDetail);
  if (newAddressDetail == -1) {
    console.log("loi dia chi ko add data");
    return;
  }

  const dataCrawl = {
    user: { use_name: useName, phone: phone },
    url: linkchay,
    nameWeb: "phongtro123.vn",
    favorite: null,
    postType: 2, // data co dc do crawl
    roomType: type,
    title: title,
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
      const useref = {
        use_name: useName,
        phone: phone,
        list_post: [{ id_nhatro: idNhaTro[0] }],
        type: 0, //0: user get by crawl from web , 1 : user from sevieces
      };

      const id_user = await databaseHandle.add_user_data(useref);
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
    console.log("Link dang dung:" + arrayLink[i]);
    return error;
  }

  const section = $(".section.section-post-listing");
  const li = section.find("ul").find("li");

  for (let j = 0; j < li.length; j++) {
    const item = $(li[j]);
    const link = item.find("a").attr("href");
    await getdataFromLink("https://phongtro123.com" + link, type);
  }
}

async function crawl_house() {
  let i, j;
  console.log("dang tim kiem house ___________");
  for (i = 0; i < 36; i++) {
    console.log("duyet :" + tinhthanh[i]);
    for (j = 1; j <= 8; j++) {
      let currentLink = linkhouse + tinhthanh[i] + "?page=" + j;
      await crawler(currentLink, 1);
      console.log("dang duyet : " + currentLink);
    }
  }
}
async function crawl_apartment() {
  let i, j;
  console.log("dang tim kiem aparment ___________");
  for (i = 0; i < 36; i++) {
    console.log("duyet :" + tinhthanh[i]);
    for (j = 1; j <= 8; j++) {
      let currentLink = linkapartment + tinhthanh[i] + "?page=" + j;
      await crawler(currentLink, 3);
      console.log("dang duyet : " + currentLink);
    }
  }
}
async function crawl_room() {
  let i, j;
  console.log("dang tim kiem rooom ___________");
  for (i = 0; i < 36; i++) {
    console.log("duyet :" + tinhthanh[i]);
    for (j = 1; j <= 8; j++) {
      let currentLink = linkroom + tinhthanh[i] + "?page=" + j;
      await crawler(currentLink, 0);
      console.log("dang duyet : " + currentLink);
    }
  }
}

async function phongtro123() {
  await crawl_room();
  await crawl_house();
  await crawl_apartment();
}

export default { phongtro123 };
