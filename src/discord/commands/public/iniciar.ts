import { createCommand, createResponder } from "#base";
import { ApplicationCommandType, ButtonBuilder, ButtonStyle, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { configCentral } from "#functions";

// Map to store users who have valid keys
export const authorizedUsers: Set<string> = new Set();

createCommand({
    name: "iniciar",
    description: "Inicia o sistema usando uma key de segurança.",
    type: ApplicationCommandType.ChatInput,
    async run(interaction) {
        const modal = new ModalBuilder({
            customId: "iniciar-modal",
            title: "Ativar Sistema"
        });
        const keyInput = new ActionRowBuilder<TextInputBuilder>().addComponents(
            new TextInputBuilder({
                customId: "key-input",
                label: "KEY DE SEGURANÇA",
                style: TextInputStyle.Short,
                required: true,
                placeholder: "Ex: KEY-DEMO-12345"
            })
        );
        modal.addComponents(keyInput);
        await interaction.showModal(modal);
    }
});

createResponder({
    customId: "iniciar-modal",
    types: ["Modal" as any],
    cache: "cached",
    async run(interaction) {
        try {
            const key = interaction.fields.getTextInputValue("key-input");
            const userId = interaction.user.id;
            
            if (configCentral.keys.active.includes(key) && !configCentral.keys.used.includes(key)) {
                // Mark key as used
                configCentral.keys.used.push(key);
                configCentral.keys.active = configCentral.keys.active.filter(k => k !== key);
                
                // Authorize user
                authorizedUsers.add(userId);
                
                await interaction.reply({
                    content: `✅ Sistema ativado com sucesso!\n\nAgora você pode usar o comando /registrar.`,
                    ephemeral: true
                });
                console.debug(`[iniciar] user ${userId} ativado com key ${key}`);
            } else if (configCentral.keys.used.includes(key)) {
                await interaction.reply({
                    content: "❌ Esta key já foi utilizada.",
                    ephemeral: true
                });
            } else {
                await interaction.reply({
                    content: "❌ Key inválida.",
                    ephemeral: true
                });
            }
        } catch (err) {
            console.error(`[iniciar] error:`, err);
            await interaction.reply({
                content: "Erro ao processar key.",
                ephemeral: true
            });
        }
    }
});

// Middleware to check if user is authorized before /registrar
export function isUserAuthorized(userId: string): boolean {
    return authorizedUsers.has(userId);
}
