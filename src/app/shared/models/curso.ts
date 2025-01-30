import { Timestamp } from "firebase/firestore";

export interface Processo {
    turma: string;
    idTeachable: number;
    tipo: string;
    inicioBootcamp: any;
    inicioInscricoes: any;
    terminoInscricoes: any;
    status: string;
    id?: string
}
export interface ProcessoNuvem {
    turma: string;
    idTeachable: number;
    tipo: string;
    inicioBootcamp: Timestamp;
    inicioInscricoes: Timestamp;
    terminoInscricoes: Timestamp;
    status: string;
    id?: string
}
