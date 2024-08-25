import React from "react";
import { Card, CardBody } from "@nextui-org/card";

interface BasicNextUICardProps {
  text: string;
  className?: string;
}

export default function BasicUICard(props: BasicNextUICardProps) {
  return (
    <Card className={props.className}>
      <CardBody>
        <p>{props.text}</p>
      </CardBody>
    </Card>
  );
}
