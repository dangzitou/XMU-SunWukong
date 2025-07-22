// 云对象教程: https://uniapp.dcloud.net.cn/uniCloud/cloud-obj
// jsdoc语法提示教程：https://ask.dcloud.net.cn/docs/#//ask.dcloud.net.cn/article/129
const db = uniCloud.databaseForJQL()
const dbCmd = db.command

module.exports = {
	_before: function () { // 通用预处理器
		db.setUser({
			role: ['admin'],
		})
	},

	// 获取项目图片的临时访问链接
	async getProjectImages(params) {
		try {
			// 设置管理员权限，允许访问数据库
			const dbForJQL = uniCloud.databaseForJQL();
			dbForJQL.setUser({
				role: ['admin']
			});

			console.log('获取项目图片参数:', params);

			// 如果提供了临时文件ID列表，直接获取这些文件的临时链接
			if (params.temp_file_ids && params.temp_file_ids.length > 0) {
				console.log('使用临时文件ID列表获取临时链接:', params.temp_file_ids);

				try {
					// 获取临时访问链接
					const tempUrlResult = await uniCloud.getTempFileURL({
						fileList: params.temp_file_ids.map(fileID => ({ fileID }))
					});

					console.log('获取临时链接结果:', tempUrlResult);

					// 处理结果
					const imageResults = [];
					if (tempUrlResult.fileList && tempUrlResult.fileList.length > 0) {
						tempUrlResult.fileList.forEach(item => {
							if (item.tempFileURL) {
								// 确保返回的是字符串而不是对象
								const tempFileURL = typeof item.tempFileURL === 'string' ?
									item.tempFileURL : item.tempFileURL.toString();
								imageResults.push({
									fileID: item.fileID,
									tempFileURL: tempFileURL
								});
							}
						});
					}

					return {
						status: 1,
						msg: "获取临时链接成功",
						data: imageResults
					};
				} catch (error) {
					console.error('获取临时链接失败:', error);
					return {
						status: 0,
						msg: "获取临时链接失败: " + error.message,
						data: []
					};
				}
			}

			// 如果没有提供临时文件ID列表，则检查是否提供了项目ID
			if (!params.project_id) {
				return {
					status: 0,
					msg: "参数不完整，请提供项目ID或文件ID列表",
					data: []
				};
			}

			console.log(`获取项目 ${params.project_id} 的图片`);

			// 如果没有提供临时文件ID，则从项目详情中获取图片
			const projectDetail = await dbForJQL.collection('xm-stp-project_detail')
				.doc(params.project_id)
				.get();

			if (!projectDetail.data || projectDetail.data.length === 0) {
				// 如果是临时项目，则返回空数组
				if (params.project_id === 'temp') {
					return {
						status: 1,
						msg: "临时项目没有图片",
						data: []
					};
				}

				return {
					status: 0,
					msg: "项目不存在",
					data: []
				};
			}

			// 获取图片数组
			const images = projectDetail.data[0].images || [];

			if (images.length === 0) {
				return {
					status: 1,
					msg: "项目没有图片",
					data: []
				};
			}

			// 检查图片数组中的第一个元素是否为直接的URL字符串
			const firstImage = images[0];
			const isDirectUrl = typeof firstImage === 'string' &&
				(firstImage.startsWith('http://') || firstImage.startsWith('https://'));

			console.log('检查图片类型:', {
				firstImage,
				isDirectUrl,
				imagesType: typeof firstImage
			});

			// 如果是直接的URL字符串，直接返回
			if (isDirectUrl) {
				console.log('图片是直接的URL字符串，直接返回');

				// 将直接的URL字符串转换为需要的格式
				const imageResults = images.map(url => ({
					fileID: url, // 使用URL作为fileID
					tempFileURL: url // 直接使用URL作为tempFileURL
				}));

				return {
					status: 1,
					msg: "获取项目图片成功",
					data: imageResults
				};
			}

			// 如果不是直接的URL，则假设是fileID，获取临时访问链接
			try {
				console.log('尝试将图片当作fileID处理');
				const tempUrlResult = await uniCloud.getTempFileURL({
					fileList: images.map(fileID => ({ fileID }))
				});

				console.log('获取临时链接结果:', tempUrlResult);

				// 处理结果
				const imageResults = [];
				if (tempUrlResult.fileList && tempUrlResult.fileList.length > 0) {
					tempUrlResult.fileList.forEach(item => {
						if (item.tempFileURL) {
							// 确保返回的是字符串而不是对象
							const tempFileURL = typeof item.tempFileURL === 'string' ?
								item.tempFileURL : item.tempFileURL.toString();
							imageResults.push({
								fileID: item.fileID,
								tempFileURL: tempFileURL
							});
						}
					});
				}

				return {
					status: 1,
					msg: "获取项目图片成功",
					data: imageResults
				};
			} catch (error) {
				console.error('获取临时链接失败:', error);

				// 如果获取临时链接失败，尝试直接返回原始图片数组
				console.log('尝试直接返回原始图片数组');
				const imageResults = images.map(img => ({
					fileID: img,
					tempFileURL: img
				}));

				return {
					status: 1,
					msg: "获取项目图片成功（直接返回原始图片）",
					data: imageResults
				};
			}
		} catch (error) {
			console.error('获取项目图片失败:', error);
			return {
				status: 0,
				msg: "获取项目图片失败: " + error.message,
				data: []
			};
		}
	},

	// 删除项目图片
	async deleteProjectImage(data) {
		try {
			// 设置管理员权限，允许访问数据库
			const dbForJQL = uniCloud.databaseForJQL();
			dbForJQL.setUser({
				role: ['admin']
			});

			if (!data.file_id || !data.project_id) {
				return {
					status: 0,
					msg: "参数不完整，请提供文件ID和项目ID"
				};
			}

			console.log(`开始删除项目图片: ${data.file_id} 从项目 ${data.project_id}`);

			// 获取项目详情
			const projectDetail = await dbForJQL.collection('xm-stp-project_detail')
				.doc(data.project_id)
				.get();

			if (!projectDetail.data || projectDetail.data.length === 0) {
				return {
					status: 0,
					msg: "项目不存在"
				};
			}

			// 获取现有图片数组
			let images = projectDetail.data[0].images || [];

			// 从数组中移除指定图片
			const newImages = images.filter(img => img !== data.file_id);

			// 如果图片存在于数组中
			if (images.length !== newImages.length) {
				// 更新项目图片数组
				await dbForJQL.collection('xm-stp-project_detail')
					.doc(data.project_id)
					.update({
						images: newImages
					});

				// 从云存储中删除文件
				try {
					await uniCloud.deleteFile({
						fileList: [data.file_id]
					});
					console.log(`已从云存储中删除文件: ${data.file_id}`);
				} catch (deleteError) {
					console.error('从云存储删除文件失败:', deleteError);
					// 即使删除云存储文件失败，我们仍然更新了数据库，所以继续返回成功
				}

				return {
					status: 1,
					msg: "图片删除成功"
				};
			} else {
				return {
					status: 0,
					msg: "图片不存在于项目中"
				};
			}
		} catch (error) {
			console.error('删除项目图片失败:', error);
			return {
				status: 0,
				msg: "删除项目图片失败: " + error.message
			};
		}
	},

	// 收藏项目
	async favoriteProject(data) {
		try {
			// 设置管理员权限，允许访问数据库
			const dbForJQL = uniCloud.databaseForJQL();
			dbForJQL.setUser({
				role: ['admin']
			});

			if (!data.user_id || !data.project_id) {
				return {
					status: 0,
					msg: "参数不完整，请提供用户ID和项目ID"
				};
			}

			console.log(`用户 ${data.user_id} 尝试收藏项目 ${data.project_id}`);

			// 检查项目是否存在
			const projectDetail = await dbForJQL.collection('xm-stp-project_detail')
				.doc(data.project_id)
				.field('_id,title')
				.get();

			if (!projectDetail.data || projectDetail.data.length === 0) {
				return {
					status: 0,
					msg: "项目不存在"
				};
			}

			// 检查是否已经收藏过
			const favoriteCheck = await dbForJQL.collection('xm-stp-project_favorite')
				.where({
					user_id: data.user_id,
					project_id: data.project_id
				})
				.get();

			if (favoriteCheck.data && favoriteCheck.data.length > 0) {
				return {
					status: 0,
					msg: "您已经收藏过该项目"
				};
			}

			// 添加收藏记录
			const favoriteResult = await dbForJQL.collection('xm-stp-project_favorite').add({
				user_id: data.user_id,
				project_id: data.project_id
				// create_time 字段由数据库自动生成
			});

			console.log('收藏结果:', favoriteResult);

			return {
				status: 1,
				msg: "收藏成功",
				data: {
					favorite_id: favoriteResult.id
				}
			};
		} catch (error) {
			console.error('收藏项目失败:', error);
			return {
				status: 0,
				msg: "收藏项目失败: " + error.message
			};
		}
	},

	// 取消收藏项目
	async unfavoriteProject(data) {
		try {
			// 设置管理员权限，允许访问数据库
			const dbForJQL = uniCloud.databaseForJQL();
			dbForJQL.setUser({
				role: ['admin']
			});

			if (!data.user_id || !data.project_id) {
				return {
					status: 0,
					msg: "参数不完整，请提供用户ID和项目ID"
				};
			}

			console.log(`用户 ${data.user_id} 尝试取消收藏项目 ${data.project_id}`);

			// 删除收藏记录
			const deleteResult = await dbForJQL.collection('xm-stp-project_favorite')
				.where({
					user_id: data.user_id,
					project_id: data.project_id
				})
				.remove();

			console.log('取消收藏结果:', deleteResult);

			if (deleteResult.deleted > 0) {
				return {
					status: 1,
					msg: "取消收藏成功"
				};
			} else {
				return {
					status: 0,
					msg: "您尚未收藏该项目"
				};
			}
		} catch (error) {
			console.error('取消收藏项目失败:', error);
			return {
				status: 0,
				msg: "取消收藏项目失败: " + error.message
			};
		}
	},

	// 检查项目是否已收藏
	async checkProjectFavorite(data) {
		try {
			// 设置管理员权限，允许访问数据库
			const dbForJQL = uniCloud.databaseForJQL();
			dbForJQL.setUser({
				role: ['admin']
			});

			if (!data.user_id || !data.project_id) {
				return {
					status: 0,
					msg: "参数不完整，请提供用户ID和项目ID",
					is_favorite: false
				};
			}

			// 检查是否已经收藏过
			const favoriteCheck = await dbForJQL.collection('xm-stp-project_favorite')
				.where({
					user_id: data.user_id,
					project_id: data.project_id
				})
				.get();

			const isFavorite = favoriteCheck.data && favoriteCheck.data.length > 0;

			return {
				status: 1,
				msg: "检查成功",
				is_favorite: isFavorite
			};
		} catch (error) {
			console.error('检查项目收藏状态失败:', error);
			return {
				status: 0,
				msg: "检查项目收藏状态失败: " + error.message,
				is_favorite: false
			};
		}
	},

	// 获取项目创建者信息
	async getProjectCreator(params) {
		try {
			// 设置管理员权限，允许访问数据库
			const dbForJQL = uniCloud.databaseForJQL();
			dbForJQL.setUser({
				role: ['admin']
			});

			if (!params.project_id) {
				return {
					status: 0,
					msg: "参数不完整，请提供项目ID",
					data: null
				};
			}

			console.log(`获取项目 ${params.project_id} 的创建者信息`);

			// 获取项目详情
			const projectDetail = await dbForJQL.collection('xm-stp-project_detail')
				.doc(params.project_id)
				.field('user_id')
				.get();

			if (!projectDetail.data || projectDetail.data.length === 0) {
				return {
					status: 0,
					msg: "项目不存在",
					data: null
				};
			}

			const creatorId = projectDetail.data[0].user_id;
			if (!creatorId) {
				return {
					status: 0,
					msg: "项目创建者ID不存在",
					data: null
				};
			}

			// 获取创建者信息
			const creatorInfo = await dbForJQL.collection('xm-stp-user_detail')
				.doc(creatorId)
				.field('_id,real_name,nickname,avatar,introduction,type')
				.get();

			if (!creatorInfo.data || creatorInfo.data.length === 0) {
				return {
					status: 0,
					msg: "创建者信息不存在",
					data: null
				};
			}

			// 处理创建者信息
			const creator = creatorInfo.data[0];
			const result = {
				_id: creator._id,
				name: creator.real_name || creator.nickname || '未知用户',
				avatar: creator.avatar || '',
				introduction: creator.introduction || '',
				type: creator.type || ''
			};

			return {
				status: 1,
				msg: "获取项目创建者信息成功",
				data: result
			};
		} catch (error) {
			console.error('获取项目创建者信息失败:', error);
			return {
				status: 0,
				msg: "获取项目创建者信息失败: " + error.message,
				data: null
			};
		}
	},

	// 获取用户收藏的项目列表
	async getFavoriteProjects(data) {
		try {
			// 设置管理员权限，允许访问数据库
			const dbForJQL = uniCloud.databaseForJQL();
			dbForJQL.setUser({
				role: ['admin']
			});

			if (!data.user_id) {
				return {
					status: 0,
					msg: "参数不完整，请提供用户ID"
				};
			}

			console.log(`获取用户 ${data.user_id} 收藏的项目列表`);

			// 获取用户收藏的项目ID列表
			const favorites = await dbForJQL.collection('xm-stp-project_favorite')
				.where({
					user_id: data.user_id
				})
				.orderBy('create_time', 'desc')
				.get();

			if (!favorites.data || favorites.data.length === 0) {
				return {
					status: 1,
					msg: "暂无收藏项目",
					data: []
				};
			}

			// 收集项目IDs
			const projectIds = favorites.data.map(f => f.project_id);

			// 获取项目详情
			const projects = await dbForJQL.collection('xm-stp-project_detail')
				.where({
					_id: dbForJQL.command.in(projectIds)
				})
				.field('_id,title,person_needed,current_members,current_person_request,user_id,create_time,images')
				.get();

			if (projects.affectedDocs === 0) {
				return {
					status: 1,
					msg: "暂无项目详情",
					data: []
				};
			}

			// 获取项目的额外信息
			const projectsExtra = await dbForJQL.collection('xm-stp-project')
				.where({
					_id: dbForJQL.command.in(projectIds)
				})
				.field('_id,type_id,ending_time,view_count')
				.get();

			// 获取项目类型信息
			const typeIds = projectsExtra.data.map(p => p.type_id).filter(Boolean);
			const projectTypes = await dbForJQL.collection('xm-stp-project_cat')
				.where({
					_id: dbForJQL.command.in([...new Set(typeIds)])
				})
				.field('_id,name')
				.get();

			// 获取项目创建者信息
			const creatorIds = projects.data.map(p => p.user_id).filter(Boolean);
			const creators = await dbForJQL.collection('xm-stp-user_detail')
				.where({
					_id: dbForJQL.command.in([...new Set(creatorIds)])
				})
				.field('_id,real_name,avatar,type')
				.get();

			// 合并项目数据
			const mergedProjects = projects.data.map(project => {
				const extraInfo = projectsExtra.data.find(p => p._id === project._id) || {};
				const typeInfo = extraInfo.type_id ?
					projectTypes.data.find(t => t._id === extraInfo.type_id) : null;
				const creatorInfo = creators.data.find(c => c._id === project.user_id) || {};
				const favoriteInfo = favorites.data.find(f => f.project_id === project._id) || {};

				return {
					...project,
					ending_time: extraInfo.ending_time,
					view_count: extraInfo.view_count || 0,
					project_cat: typeInfo ? { id: typeInfo._id, name: typeInfo.name } : null,
					creator_name: creatorInfo.real_name || '',
					creator_avatar: creatorInfo.avatar || '',
					creator_type: creatorInfo.type,
					favorite_time: favoriteInfo.create_time
				};
			});

			return {
				status: 1,
				msg: "获取成功",
				data: mergedProjects
			};
		} catch (error) {
			console.error('获取收藏项目列表失败:', error);
			return {
				status: 0,
				msg: "获取收藏项目列表失败: " + error.message,
				data: []
			};
		}
	}
}
