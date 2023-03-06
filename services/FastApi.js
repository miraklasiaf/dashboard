import fastapi from './Servers';

export const postProcessing_1 = (intput_string, user_uuid) => {
    let requestData = {'input_string': intput_string, 'user_uuid': user_uuid};
    try {
         fastapi.post('/task_hello_world/', requestData, {
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then(response => {
                console.log('postProcessing_1 response: ', response.data);
                return response.data;
            })
            .catch(error => {
                console.log('postProcessing_1 error: ', error);
                return error;
            }
            );
    } catch (error) {
        console.log('postProcessing_1 error: ', error);
        return error;
    }
};

  export const getProcessing_1_status = (task_uuid, user_uuid) => {
    let requestData = {'task_uuid': task_uuid, 'user_uuid': user_uuid};
    return http.get("/check_task", requestData, {
        headers: {
            "Content-Type": "application/json",
        },
    });
  };

