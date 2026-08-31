import React, { ReactNode } from "react";
import { useWindowDimensions, View } from "react-native";

interface RowProps {
  children: ReactNode;
  gap?: number;
}

interface ColProps {
  children: ReactNode;
  sm?: number;
  md?: number;
  lg?: number;
}

export function Row({
  children,
  gap = 16,
}: RowProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        marginHorizontal: -gap / 2,
      }}
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;

        return React.cloneElement(child as React.ReactElement<any>, {
          rowGap: gap,
        });
      })}
    </View>
  );
}

export function Col({
  children,
  sm = 12,
  md,
  lg,
  rowGap = 16,
}: ColProps & { rowGap?: number }) {
  const { width } = useWindowDimensions();

  let columns = sm;

  // Tablet
  if (width >= 768 && md) {
    columns = md;
  }

  // Desktop / Large Tablet
  if (width >= 1024 && lg) {
    columns = lg;
  }

  const widthPercentage =
  `${(columns / 12) * 100}%` as `${number}%`;

  return (
    <View
      style={{
        width: widthPercentage,
        paddingHorizontal: rowGap / 2,
        marginBottom: 4,
      }}
    >
      {children}
    </View>
  );
}