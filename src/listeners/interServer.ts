import { Listener } from '@sapphire/framework';
import { randomUUID } from 'crypto';
import { AttachmentBuilder, type Message, TextChannel } from 'discord.js';

export class InterServerListener extends Listener {
	public constructor(context: Listener.LoaderContext, options: Listener.Options) {
		super(context, {
			...options,
			event: 'messageCreate'
		});
	}

	public async run(message: Message) {
		if (message.author.bot) return;
		if (!message.guild || !message.channel) return;
		if (message.content.startsWith('/') || message.content.startsWith('!')) return;

		const interServerConfig = {
			greenwoods: {
				guildId: process.env.INTER_GREENWOODS_GUILD_ID!,
				channelId: process.env.INTER_GREENWOODS_CHANNEL_ID!
			},
			sanctuaire: {
				guildId: process.env.INTER_SANCTUAIRE_GUILD_ID!,
				channelId: process.env.INTER_SANCTUAIRE_CHANNEL_ID!
			}
		};

		if (
			(message.guildId === interServerConfig.greenwoods.guildId && message.channelId === interServerConfig.greenwoods.channelId) ||
			(message.guildId === interServerConfig.sanctuaire.guildId && message.channelId === interServerConfig.sanctuaire.channelId)
		) {
			if (message.guildId === interServerConfig.greenwoods.guildId) {
				// Forward to Sanctuaire
				const sanctuaireGuild = await this.container.client.guilds.fetch(interServerConfig.sanctuaire.guildId);
				const sanctuaireChannel = await sanctuaireGuild.channels.fetch(interServerConfig.sanctuaire.channelId);

				if (!sanctuaireChannel || sanctuaireChannel.isDMBased() || !(sanctuaireChannel instanceof TextChannel)) return;

				let webhook = await sanctuaireChannel.fetchWebhooks().then((hooks) => hooks.find((hook) => hook.name === 'InterServerWebhook'));
				if (!webhook) {
					webhook = await sanctuaireChannel.createWebhook({ name: 'InterServerWebhook', reason: 'Inter-server communication' });
				}

				const files: AttachmentBuilder[] = [];

				if (message.attachments.size > 0) {
					for (const attachment of message.attachments.values()) {
						files.push(
							new AttachmentBuilder(attachment.url, {
								name: randomUUID() + attachment.name?.substring(attachment.name.lastIndexOf('.'))
							})
						);
					}
				}

				await webhook.send({
					content: message.content,
					username: `GreenWoods - ${message.author.displayName}`,
					avatarURL: message.author.displayAvatarURL(),
					files: files.length > 0 ? files : undefined,
					allowedMentions: { parse: [] }
				});
			} else if (message.guildId === interServerConfig.sanctuaire.guildId) {
				// Forward to Greenwoods
				const greenwoodsGuild = await this.container.client.guilds.fetch(interServerConfig.greenwoods.guildId);
				const greenwoodsChannel = await greenwoodsGuild.channels.fetch(interServerConfig.greenwoods.channelId);

				if (!greenwoodsChannel || greenwoodsChannel.isDMBased() || !(greenwoodsChannel instanceof TextChannel)) return;

				let webhook = await greenwoodsChannel.fetchWebhooks().then((hooks) => hooks.find((hook) => hook.name === 'InterServerWebhook'));
				if (!webhook) {
					webhook = await greenwoodsChannel.createWebhook({ name: 'InterServerWebhook', reason: 'Inter-server communication' });
				}

				const files: AttachmentBuilder[] = [];

				if (message.attachments.size > 0) {
					for (const attachment of message.attachments.values()) {
						files.push(
							new AttachmentBuilder(attachment.url, {
								name: randomUUID() + attachment.name?.substring(attachment.name.lastIndexOf('.'))
							})
						);
					}
				}

				await webhook.send({
					content: message.content,
					username: `Sanctuaire - ${message.author.displayName}`,
					avatarURL: message.author.displayAvatarURL(),
					files: files.length > 0 ? files : undefined,
					allowedMentions: { parse: [] }
				});
			}
		}
	}
}
