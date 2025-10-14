import { XOR } from "ts-xor";
import {Alert as OwnAlert, AlertProps as OwnAlertProps} from "./alert";
import {Alert as ShadcnAlert} from "../../shadcn/alert";
import { ShadcnAlertProps } from "./_components";
export * from "./_components";

type ConditionAlertProps = XOR<OwnAlertProps, ShadcnAlertProps>;
const Alert = (props: ConditionAlertProps) =>{
    if ("type" in props){
        return <OwnAlert {...props} />;
    }
    return <ShadcnAlert {...props} />;

};

export { Alert };