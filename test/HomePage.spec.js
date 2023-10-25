import { mount } from '@vue/test-utils';
import HomePage from '../src/components/HomePage.vue'; // 确保路径正确

describe('HomePage.vue', () => {
  it('fetchNames method should update nameList correctly', async () => {
    const wrapper = mount(HomePage);

    // motify the user input
    await wrapper.setData({ userInput: 'California' });

    // motify network request
    const mockFetchNames = jest.fn().mockResolvedValue(['California']);
    wrapper.vm.fetchNames = mockFetchNames;

    // execute the fetchNames method
    await wrapper.vm.fetchNames();

    // check nameList is correct or not
    expect(wrapper.vm.nameList).toEqual(['California']);

    // check fetchNames method is used or not
    expect(mockFetchNames).toHaveBeenCalledWith('California');
  });
});