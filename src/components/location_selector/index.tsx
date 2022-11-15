import { Button, Drawer, Space } from "@pankod/refine-antd";
import React, { CSSProperties, FC, useMemo, useRef, useState } from "react";
import {
  Placemark,
  YMaps,
  Map,
  SearchControl,
  MapState,
  MapStateBase,
  MapStateCenter,
} from "react-yandex-maps";
import { useNotification } from "@pankod/refine-core";
import * as gql from "gql-query-builder";
import { client } from "graphConnect";

export interface StylesDictionary {
  [Key: string]: CSSProperties;
}
const styles: StylesDictionary = {
  wrapper: {
    display: "block",
    width: "100%",
    position: "relative",
  },
  input: {
    fontFamily: "monospace",
    display: "block",
    width: "100%",
  },
  chooseButtonBlock: {
    position: "absolute",
    top: 0,
    right: 0,
  },
};
interface OnChangeHandler {
  (e: any): void;
}
interface OnSetAddressHandler {
  (e: any): void;
}
interface MyInputProps {
  value: string;
  onChange: OnChangeHandler;
  onSetAddress: OnSetAddressHandler;
}
const LocationSelectorInput: FC<MyInputProps> = ({
  value,
  onChange,
  onSetAddress,
}: MyInputProps) => {
  const [visible, setVisible] = useState(false);
  const map = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [ymaps, setYmaps] = useState<any>(null);
  const objects = useRef<any>(null);
  const [coordinates, setCoordinates] = useState<any>(null);

  const { open } = useNotification();

  const [mapCenter, setMapCenter] = useState([
    41.311151, 69.279737,
  ] as number[]);
  const [mapZoom, setMapZoom] = useState(16);

  const onCancel = () => {
    setVisible(false);
  };

  const onSave = async () => {
    if (!coordinates) {
      open!({
        type: "error",
        message: "Выберите место на карте",
      });
      return;
    }
    setIsLoading(true);
    onChange(coordinates);
    const { query, variables } = gql.query({
      operation: "getAddressForCoordinates",
      variables: {
        lat: {
          value: coordinates[0],
          required: true,
        },
        lng: {
          value: coordinates[1],
          required: true,
        },
      },
    });
    const { getAddressForCoordinates } = await client.request(query, variables);
    onSetAddress(getAddressForCoordinates);
    setIsLoading(false);
    setVisible(false);
  };

  const mapState = useMemo<MapState>(() => {
    const baseState: MapStateBase = {
      controls: ["zoomControl", "fullscreenControl", "geolocationControl"],
    };
    const mapStateCenter: MapStateCenter = {
      center: mapCenter || [],
      zoom: mapZoom || 10,
    };

    const res: MapState = Object.assign({}, baseState, mapStateCenter);
    return res;
  }, [mapCenter, mapZoom]);
  const clickOnMap = async (event: any) => {
    const coords = event.get("coords") || event.get("position");

    let polygon = objects.current.searchContaining(coords).get(0);
    if (!polygon) {
      open!({
        message: "Мойка в выбранной области невозможна",
        type: "error",
      });
      return;
    }

    setMapCenter(coords);
    setMapZoom(17);
    setCoordinates(coords);

    let house = "";
  };

  const loadPolygonsToMap = (ymaps: any) => {
    setYmaps(ymaps);
    map.current.controls.remove("geolocationControl");
    var geolocationControl = new ymaps.control.GeolocationControl({
      options: { noPlacemark: true },
    });
    geolocationControl.events.add("locationchange", function (event: any) {
      var position = event.get("position"),
        // При создании метки можно задать ей любой внешний вид.
        locationPlacemark = new ymaps.Placemark(position);

      clickOnMap(event);
      // Установим новый центр карты в текущее местоположение пользователя.
      map.current.panTo(position);
    });
    map.current.controls.add(geolocationControl);
    let geoObjects: any = {
      type: "FeatureCollection",
      metadata: {
        name: "delivery",
        creator: "Yandex Map Constructor",
      },
      features: [],
    };
    let polygon: any = {
      type: "Feature",
      id: 0,
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [41.268156999999995, 69.128359],
            [41.269059999999996, 69.131587],
            [41.271735, 69.134207],
            [41.272946, 69.136849],
            [41.276094, 69.140481],
            [41.277795999999995, 69.140956],
            [41.278599, 69.143072],
            [41.28039, 69.14468099999999],
            [41.281189, 69.146281],
            [41.280938, 69.147487],
            [41.276178, 69.146256],
            [41.264949, 69.146862],
            [41.262465999999996, 69.14766999999999],
            [41.257897, 69.152318],
            [41.252508999999996, 69.16091899999999],
            [41.250116, 69.163371],
            [41.240251, 69.166724],
            [41.235859, 69.164551],
            [41.234711, 69.16883],
            [41.228311, 69.17406199999999],
            [41.227142, 69.17383099999999],
            [41.226031, 69.171825],
            [41.225437, 69.172448],
            [41.225131999999995, 69.1719],
            [41.222522999999995, 69.17440599999999],
            [41.221705, 69.173963],
            [41.221347, 69.175516],
            [41.218765, 69.17452899999999],
            [41.217679, 69.176369],
            [41.218942999999996, 69.177613],
            [41.217906, 69.179644],
            [41.219012, 69.180585],
            [41.216887, 69.18368],
            [41.214518999999996, 69.18139],
            [41.211558, 69.185349],
            [41.210423999999996, 69.18516199999999],
            [41.208298, 69.182919],
            [41.207167, 69.183037],
            [41.206813, 69.182244],
            [41.205957, 69.182814],
            [41.204938, 69.18563499999999],
            [41.200238999999996, 69.184677],
            [41.196953, 69.185696],
            [41.178349999999995, 69.20217699999999],
            [41.176108, 69.205163],
            [41.174372, 69.208795],
            [41.168127, 69.22782099999999],
            [41.166047, 69.2372],
            [41.165943999999996, 69.246847],
            [41.16363, 69.269052],
            [41.16429, 69.27765699999999],
            [41.166765, 69.283547],
            [41.178768, 69.302005],
            [41.214557, 69.349649],
            [41.244779, 69.396428],
            [41.255393999999995, 69.382689],
            [41.256813, 69.384897],
            [41.256161, 69.385859],
            [41.257101, 69.387585],
            [41.263166999999996, 69.395308],
            [41.262741, 69.395867],
            [41.264666, 69.397637],
            [41.265350999999995, 69.397499],
            [41.266051, 69.395214],
            [41.265116, 69.385718],
            [41.265786, 69.382656],
            [41.267573, 69.381892],
            [41.270997, 69.384434],
            [41.272270999999996, 69.38459],
            [41.2744, 69.387379],
            [41.275278, 69.389943],
            [41.287441, 69.40397899999999],
            [41.299400999999996, 69.419676],
            [41.300598, 69.42032],
            [41.302605, 69.424032],
            [41.306051, 69.426446],
            [41.308648, 69.429783],
            [41.311333999999995, 69.435587],
            [41.316196, 69.44225],
            [41.321290999999995, 69.451605],
            [41.324639999999995, 69.45344],
            [41.327389, 69.45624],
            [41.334227, 69.467107],
            [41.334575, 69.46862999999999],
            [41.343049, 69.47363],
            [41.346329, 69.477728],
            [41.348894, 69.47395399999999],
            [41.346437, 69.466701],
            [41.345242999999996, 69.459437],
            [41.344674999999995, 69.439343],
            [41.342352999999996, 69.40828499999999],
            [41.344719999999995, 69.41039599999999],
            [41.34876, 69.41197],
            [41.355565, 69.410704],
            [41.361526, 69.407038],
            [41.363828, 69.404803],
            [41.363054, 69.401507],
            [41.364886999999996, 69.400969],
            [41.364793999999996, 69.399807],
            [41.365967999999995, 69.398882],
            [41.364283, 69.39581299999999],
            [41.36588, 69.39262699999999],
            [41.365896, 69.390042],
            [41.361307, 69.375875],
            [41.362341, 69.36345399999999],
            [41.361382, 69.36174199999999],
            [41.356254, 69.357372],
            [41.354760999999996, 69.353788],
            [41.354710999999995, 69.35090799999999],
            [41.356024999999995, 69.344021],
            [41.359828, 69.337904],
            [41.369859999999996, 69.324895],
            [41.382705, 69.31893],
            [41.384521, 69.3168],
            [41.385135, 69.311696],
            [41.383928999999995, 69.300989],
            [41.38378, 69.285277],
            [41.385518999999995, 69.280318],
            [41.39602, 69.26379],
            [41.397267, 69.260622],
            [41.397892999999996, 69.256446],
            [41.398483, 69.238466],
            [41.398140999999995, 69.234762],
            [41.396761999999995, 69.230989],
            [41.387105, 69.215385],
            [41.386818, 69.211139],
            [41.383958, 69.210325],
            [41.360565, 69.173579],
            [41.356401999999996, 69.168825],
            [41.349795, 69.165539],
            [41.336797999999995, 69.163988],
            [41.333724, 69.162888],
            [41.328157, 69.159784],
            [41.328246, 69.157916],
            [41.327244, 69.156711],
            [41.327278, 69.154816],
            [41.325969, 69.154669],
            [41.325235, 69.153437],
            [41.323420999999996, 69.153548],
            [41.322474, 69.154532],
            [41.321106, 69.153533],
            [41.32064, 69.154294],
            [41.320324, 69.152487],
            [41.313393999999995, 69.147759],
            [41.313606, 69.146472],
            [41.311658, 69.148018],
            [41.310157, 69.147221],
            [41.309906, 69.148279],
            [41.308352, 69.14895],
            [41.305306, 69.148501],
            [41.303999, 69.147503],
            [41.302782, 69.145161],
            [41.300591, 69.144735],
            [41.299876999999995, 69.142802],
            [41.29887, 69.14282899999999],
            [41.296827, 69.141066],
            [41.294942, 69.138426],
            [41.292438, 69.138094],
            [41.289746, 69.133648],
            [41.288700999999996, 69.13380599999999],
            [41.288018, 69.13203899999999],
            [41.287290999999996, 69.131901],
            [41.283927, 69.134872],
            [41.281258, 69.134081],
            [41.280372, 69.132829],
            [41.278931, 69.13331099999999],
            [41.278996, 69.13149],
            [41.275965, 69.128565],
            [41.274085, 69.128132],
            [41.272017, 69.125483],
            [41.270109, 69.125187],
            [41.26989, 69.122709],
            [41.265549, 69.121762],
            [41.267244999999996, 69.123256],
            [41.266883, 69.125254],
          ],
        ],
      },
      properties: {
        fill: "#FAAF04",
        fillOpacity: 0.1,
        stroke: "#FAAF04",
        strokeWidth: "7",
        strokeOpacity: 0.4,
      },
    };
    geoObjects.features.push(polygon);
    let deliveryZones = ymaps.geoQuery(geoObjects).addToMap(map.current);
    deliveryZones.each((obj: any) => {
      obj.options.set({
        fillColor: obj.properties.get("fill"),
        fillOpacity: obj.properties.get("fillOpacity"),
        strokeColor: obj.properties.get("stroke"),
        strokeWidth: obj.properties.get("strokeWidth"),
        strokeOpacity: obj.properties.get("strokeOpacity"),
      });
      obj.events.add("click", clickOnMap);
    });
    objects.current = deliveryZones;
  };

  return (
    <>
      <div style={styles.wrapper}>
        <input
          type="text"
          readOnly
          value={value}
          onChange={onChange}
          style={styles.input}
          className="ant-input"
        />
        <div style={styles.chooseButtonBlock}>
          <Button type="link" onClick={() => setVisible(true)}>
            Выбрать локацию
          </Button>
        </div>
      </div>
      <Drawer
        title="Выбрать локацию"
        placement="bottom"
        size="large"
        onClose={onCancel}
        visible={visible}
        extra={
          <Space>
            <Button onClick={onCancel}>Отмена</Button>
            <Button type="primary" onClick={onSave} loading={isLoading}>
              Выбрать
            </Button>
          </Space>
        }
      >
        <YMaps
          query={{
            apikey: "3ed59fd3-eed6-4f1e-ab3b-f91416386f10",
            ns: "use-load-option",
            load: "Map,Placemark,control.ZoomControl,control.FullscreenControl,geoObject.addon.balloon",
          }}
        >
          <Map
            state={mapState}
            onLoad={(ymaps: any) => loadPolygonsToMap(ymaps)}
            instanceRef={(ref) => (map.current = ref)}
            onClick={clickOnMap}
            modules={[
              "control.ZoomControl",
              "control.FullscreenControl",
              "control.GeolocationControl",
              "geoQuery",
            ]}
            width="100%"
            height="100%"
          >
            <SearchControl
              options={{
                float: "right",
              }}
            />
            <Placemark geometry={mapCenter} />
          </Map>
        </YMaps>
      </Drawer>
    </>
  );
};
export default LocationSelectorInput;
