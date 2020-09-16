export interface ServiceCallStatus {
    $status: 'requested' | 'received' | 'error';
    $error: string;
    $received: Date;
}
