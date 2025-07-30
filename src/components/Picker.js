import react, { useRef, useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Dimensions,
  TextInput,
  FlatList,
  RefreshControl,
} from "react-native";
import RBSheet from "react-native-raw-bottom-sheet";
import { Ionicons, AntDesign } from "@expo/vector-icons";

import Shared from "../themes/shared";

export const Picker = ({
  value,
  onSelect,
  openSheet,
  label,
  placeholder = "",
  coverStyle = {},
  RightIcon,
  LeftIcon,
  style = {},
  labelStyle = {},
  items = [],
  itemStyle = {},
  hasSearch = true,
  hasAdd = false,
  disabled = false,
  drawerRatio = 0.65,
  renderItem,
  noLabel = false,
  paginationOptions,
  refetchOptions,
  ListHeaderComponent,
}) => {
  const bottomSheet = useRef(null);
  const [search, setSearch] = useState("");

  return (
    <>
      <TouchableOpacity
        onPress={() => {
          if (!disabled) {
            bottomSheet.current?.open?.();
          }
        }}
        activeOpacity={disabled ? 1 : 0.8}
        // style={{ ...Shared.Select.default }}
        variant={"rounded"}
        style={{
          alignItems: "center",
          //  backgroundColor: "#ffffff",
          //  borderColor: "grey",
          //borderRadius: 4,
          // borderWidth: 1,
          flexDirection: "row",
          height: 50,
          justifyContent: "space-between",
          marginVertical: 10,
          paddingHorizontal: 5,
          position: "relative",
          width: "100%",
          ...coverStyle,
          ...Shared.Select.default,
        }}
      >
        {/*  */}
        {/* {!noLabel && value && placeholder !== "" && (
          <Text
            style={{
              backgroundColor: "#ffffff",
              color: "#00000",
              left: 5,
              paddingHorizontal: 5,
              position: "absolute",
              top: -12,
              ...labelStyle,
            }}
          >
            {label || placeholder}
          </Text>
        )} */}
        {LeftIcon && <View style={{ marginLeft: 10 }}>{LeftIcon}</View>}
        <View
          style={{
            alignItems: "flex-start",
            flex: 1,
            height: 60,
            justifyContent: "center",
            marginHorizontal: 10,
            ...style,
          }}
        >
          <Text
            style={{
              color: "black",
              // color: value?.label ? "blue" : "red",
              fontSize: 14,
            }}
          >
            {value && value?.label ? value.label : placeholder}
          </Text>
        </View>
        <View style={{ marginLeft: 10, marginRight: 5 }}>
          {RightIcon ?? <AntDesign name="down" size={15} color="black" />}
        </View>
      </TouchableOpacity>
      <RBSheet
        ref={bottomSheet}
        height={Dimensions.get("window").height * drawerRatio}
        openDuration={500}
        dragFromTopOnly
        closeOnDragDown
        customStyles={{
          container: {
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          },
          draggableIcon: {
            backgroundColor: "grey",
            borderRadius: 100,
            height: 5,
            width: 50,
          },
        }}
      >
        <View style={{ flex: 1 }}>
          {hasAdd && (
            <View
              style={{
                alignItems: "center",
                flexDirection: "row",
                paddingHorizontal: 10,
                // width: Dimensions.get('window').width - 45,
              }}
            >
              <TouchableOpacity onPress={() => bottomSheet.current?.close()}>
                <Ionicons name="close" size={30} color="black" />
              </TouchableOpacity>
              <TextInput
                placeholder="Search customer"
                value={search}
                onChangeText={(val) => setSearch(val)}
              />
              <TouchableOpacity
                onPress={openSheet}
                style={{ marginHorizontal: 10 }}
              >
                <Ionicons name="add" size={35} color="black" />
              </TouchableOpacity>
            </View>
          )}
          {hasSearch && (
            <View style={{ paddingHorizontal: 20 }}>
              <TextInput
                placeholder="Search"
                value={search}
                onChangeText={(val) => setSearch(val)}
              />
            </View>
          )}
          <FlatList
            style={{ paddingHorizontal: 20 }}
            data={items.filter((item) =>
              item?.label?.toLowerCase()?.includes(search?.toLowerCase())
            )}
            refreshControl={
              refetchOptions && (
                <RefreshControl
                  colors={[primaryBlue]}
                  tintColor={primaryBlue}
                  refreshing={Boolean(refetchOptions?.isRefetching)}
                  onRefresh={() => refetchOptions?.refetch?.()}
                />
              )
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  bottomSheet.current?.close?.();
                  onSelect(item);
                }}
                style={{
                  paddingVertical: 10,
                  ...itemStyle,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                  }}
                >
                  {renderItem ? renderItem?.(item) : item?.label}
                </Text>
              </TouchableOpacity>
            )}
            ListHeaderComponent={ListHeaderComponent}
            ListFooterComponent={() => {
              return (
                <>
                  {paginationOptions?.isFetchingNextPage && (
                    <>'add ur custom loader here'</>
                  )}
                </>
              );
            }}
            onEndReached={() => {
              if (paginationOptions?.hasNextPage) {
                paginationOptions?.fetchNextPage?.();
              }
            }}
          />
          <View style={{ height: 50 }} />
        </View>
      </RBSheet>
    </>
  );
};
