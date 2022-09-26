import map from "./hethongphuongxa2.js";

async function encodeAddress(address) {
  console.log("address 2222:", address);

  console.log(map.hethongtinhthanh[address.city]);

  const cityCode = await map.hethongtinhthanh[address.city];
  let tmp1 = cityCode + " - " + address.district;
  const districtCode = await map.dshuyenthixa[tmp1];
  console.log(districtCode);

  let result = [];
  if (cityCode == undefined || districtCode == undefined) return -1;
  if (address.ward == "") {
    result = [
      cityCode + districtCode + "00000",
      {
        more: address.more,
        stress: address.stress,
        ward: "",
        district: address.district,
        city: address.city,
        wardCode: "",
        districtCode: districtCode,
        cityCode: cityCode,
      },
    ];
    return result;
  } else {
    const tmp2 = districtCode + " - " + address.ward;
    console.log("tmp2: ", tmp2);

    const wardCode = map.hethongxaphuong[tmp2];
    if (wardCode != undefined) {
      result = [
        cityCode + districtCode + wardCode,
        {
          more: address.more,
          stress: address.stress,
          ward: address.ward,
          district: address.district,
          city: address.city,
          wardCode: wardCode,
          districtCode: districtCode,
          cityCode: cityCode,
        },
      ];
      return result;
    } else {
      console.log("by ward", wardCode);
      return -1;
    }
  }
}

export default { encodeAddress };
