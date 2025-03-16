export interface UserUpdateDto {
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNo?: string;
}

export interface UpdatePasswordDto {
    currentPassword: string;
    newPassword: string;
}