import { message } from 'antd';

// 2.0.15 has no Snackbar component yet; this maps the calls the add-on pages make onto antd message.
type Severity = 'info' | 'success' | 'warning' | 'error';

export interface SnackbarOptions {
    severity?: Severity;
    title: string;
    description?: string;
}

export interface SnackbarApi {
    notify: (options: SnackbarOptions) => void;
    success: (text: string) => void;
    error: (text: string) => void;
}

export const snackbar: SnackbarApi = {
    notify: ({ severity = 'info', title, description }) => {
        message.open({ type: severity, content: description ? `${title}: ${description}` : title });
    },
    success: (text) => {
        message.success(text);
    },
    error: (text) => {
        message.error(text);
    },
};
