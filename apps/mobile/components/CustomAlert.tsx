import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';

export type AlertButton = {
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
};

interface CustomAlertProps {
    visible: boolean;
    title: string;
    message?: string;
    buttons?: AlertButton[];
    onClose: () => void;
}

export function CustomAlert({ visible, title, message, buttons, onClose }: CustomAlertProps) {
    // Se nenhum botão for passado, o padrão será um botão de OK
    const alertButtons = buttons && buttons.length > 0 ? buttons : [{ text: 'OK', onPress: onClose }];

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View className="flex-1 justify-center items-center bg-black/60 px-6">
                <View className="bg-card-dark w-full max-w-sm rounded-[24px] p-6 shadow-xl border border-white/5">
                    <Text className="text-white text-xl font-bold mb-2 text-center">{title}</Text>
                    {message && (
                        <Text className="text-gray-300 text-base mb-6 text-center leading-relaxed">{message}</Text>
                    )}

                    <View className={`flex-row justify-end mt-2 ${alertButtons.length > 2 ? 'flex-col' : 'gap-3'}`}>
                        {alertButtons.map((btn, index) => {
                            const handlePress = () => {
                                onClose();
                                if (btn.onPress) {
                                    setTimeout(btn.onPress, 100); // aguarda a animação do modal sumir
                                }
                            };

                            const isCancel = btn.style === 'cancel';
                            const isDestructive = btn.style === 'destructive';

                            // Define o estilo baseado no estilo do botão
                            let buttonStyle = 'bg-white';
                            let textStyle = 'text-black';

                            if (isCancel) {
                                buttonStyle = 'bg-transparent border border-gray-600';
                                textStyle = 'text-gray-300';
                            } else if (isDestructive) {
                                buttonStyle = 'bg-primary';
                                textStyle = 'text-white';
                            }

                            return (
                                <TouchableOpacity
                                    key={index}
                                    onPress={handlePress}
                                    className={`py-3 px-5 rounded-2xl items-center justify-center ${buttonStyle} ${alertButtons.length > 2 ? 'w-full mb-3' : 'flex-1'
                                        }`}
                                    activeOpacity={0.7}
                                >
                                    <Text className={`font-bold text-[15px] ${textStyle}`}>
                                        {btn.text}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            </View>
        </Modal>
    );
}
