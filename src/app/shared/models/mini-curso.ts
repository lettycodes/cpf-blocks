export interface MiniCurso {
    id?: string;
    titulo: string;
    topicos: Topicos[]
}

export interface Topicos {
    subtitulo: string;
    texto: string;
    imagemURL?: string | File;
}